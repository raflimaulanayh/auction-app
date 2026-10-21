import { Button, ProgressBar } from '@heroui/react'
import { ShoppingCartIcon, TrendDownIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dutchNextDropIn, dutchPrice } from '../../lib/auction-rules'
import { formatRupiah } from '../../lib/money'
import { useNow } from '../../lib/time'
import type { AuctionDetail } from '../../services/auctionService'
import { useBuyNow } from '../../services/queries'

export function DutchPanel({ detail, live }: { detail: AuctionDetail; live: boolean }) {
  const { t } = useTranslation()
  const now = useNow()
  const { auction } = detail
  const price = dutchPrice(auction, now)
  const floor = auction.floorPrice ?? 0
  const dropIn = Math.ceil(dutchNextDropIn(auction, now) / 1000)
  const dropped =
    ((auction.startingPrice - price) / Math.max(1, auction.startingPrice - floor)) * 100
  const buyNow = useBuyNow(auction.id)
  const [confirming, setConfirming] = useState(false)

  // Two-step buy: the price keeps moving, so make the commitment explicit.
  useEffect(() => {
    if (!confirming) return
    const id = setTimeout(() => setConfirming(false), 4000)
    return () => clearTimeout(id)
  }, [confirming])

  return (
    <div className="space-y-5">
      <ProgressBar aria-label={t('dutch.progress')} value={dropped} color="warning" size="sm">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>{formatRupiah(auction.startingPrice, true)}</span>
          <span>
            {t('dutch.floor')}: {formatRupiah(floor, true)}
          </span>
        </div>
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>

      {live && price > floor && (
        <div className="flex items-center justify-between rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-soft-foreground">
          <span className="flex items-center gap-2">
            <TrendDownIcon weight="bold" />
            {t('dutch.nextDrop', { amount: formatRupiah(auction.decrement ?? 0, true) })}
          </span>
          <span className="tabular text-lg font-bold">{dropIn}s</span>
        </div>
      )}

      <p className="text-xs text-muted">
        {t('dutch.dropInfo', {
          amount: formatRupiah(auction.decrement ?? 0),
          seconds: auction.intervalSec,
          floor: formatRupiah(floor),
        })}
      </p>

      {live && (
        <Button
          fullWidth
          size="lg"
          variant={confirming ? 'danger' : 'primary'}
          isPending={buyNow.isPending}
          onPress={() => {
            if (!confirming) return setConfirming(true)
            setConfirming(false)
            buyNow.mutate()
          }}
        >
          <ShoppingCartIcon weight="fill" />
          {confirming ? t('dutch.confirm') : t('dutch.buyAt', { price: formatRupiah(price) })}
        </Button>
      )}
    </div>
  )
}
