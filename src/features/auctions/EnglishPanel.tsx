import { Button, Chip, toast } from '@heroui/react'
import {
  CheckCircleIcon,
  LightningIcon,
  RobotIcon,
  ShieldCheckIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { bidIncrement, minNextBid, reserveMet } from '../../lib/auction-rules'
import { formatRupiah } from '../../lib/money'
import type { AuctionDetail } from '../../services/auctionService'
import { useBuyNow, usePlaceBid, useSetProxy } from '../../services/queries'
import type { User } from '../../types'
import { MoneyInput } from './MoneyInput'

export function EnglishPanel({
  detail,
  user,
  live,
}: {
  detail: AuctionDetail
  user: User
  live: boolean
}) {
  const { t } = useTranslation()
  const { auction, bids, bidCount, myProxyMax } = detail
  const min = minNextBid(auction, bidCount)
  const leaderId = bids[0]?.userId
  const isLeading = leaderId === user.id
  const hasBid = bids.some((b) => b.userId === user.id)

  const [typed, setAmount] = useState(min)
  const [proxyMax, setProxyMax] = useState(min + bidIncrement(min) * 5)
  // Keep the suggested amount valid as other bids come in.
  const amount = Math.max(typed, min)

  const placeBid = usePlaceBid(auction.id)
  const setProxy = useSetProxy(auction.id)
  const buyNow = useBuyNow(auction.id)

  const submitBid = (value: number) =>
    placeBid.mutate(value, {
      onSuccess: (r) =>
        r.leaderId === user.id
          ? toast.success(t('english.bidSuccess', { amount: formatRupiah(value) }))
          : toast.warning(t('english.bidCountered')),
    })

  const quick = [min, min + bidIncrement(min), min + bidIncrement(min) * 3]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {auction.reservePrice !== undefined && (
          <Chip
            size="sm"
            variant="soft"
            color={reserveMet(auction, bidCount) ? 'success' : 'warning'}
          >
            {reserveMet(auction, bidCount) ? (
              <CheckCircleIcon weight="bold" />
            ) : (
              <WarningIcon weight="bold" />
            )}
            <Chip.Label>
              {reserveMet(auction, bidCount) ? t('auction.reserveMet') : t('auction.reserveNotMet')}
            </Chip.Label>
          </Chip>
        )}
        {hasBid && live && (
          <Chip size="sm" variant="primary" color={isLeading ? 'success' : 'danger'}>
            <Chip.Label>{isLeading ? t('english.leading') : t('english.outbidState')}</Chip.Label>
          </Chip>
        )}
      </div>

      {live && (
        <>
          <div className="space-y-3">
            <p className="text-xs text-muted">
              {t('english.minNext')}:{' '}
              <span className="font-semibold text-foreground">{formatRupiah(min)}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {quick.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(q)}
                  className={`tabular rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                    amount === q
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  {formatRupiah(q, true)}
                </button>
              ))}
            </div>
            <MoneyInput id="bid" label={t('english.yourBid')} value={amount} onChange={setAmount} />
            <Button
              fullWidth
              size="lg"
              isPending={placeBid.isPending}
              isDisabled={amount < min}
              onPress={() => submitBid(amount)}
            >
              <LightningIcon weight="fill" />
              {t('english.placeBid')} · {formatRupiah(amount)}
            </Button>
            {auction.buyNowPrice && auction.currentPrice < auction.buyNowPrice && (
              <Button
                fullWidth
                variant="secondary"
                isPending={buyNow.isPending}
                onPress={() => buyNow.mutate()}
              >
                {t('english.buyNow', { price: formatRupiah(auction.buyNowPrice) })}
              </Button>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-surface-secondary p-4">
            <div className="flex items-center gap-2">
              <RobotIcon weight="duotone" className="size-5 text-accent" />
              <p className="font-semibold">{t('english.proxyTitle')}</p>
            </div>
            <p className="text-xs text-muted">{t('english.proxyDesc')}</p>
            {myProxyMax !== undefined && (
              <Chip size="sm" color="accent" variant="soft">
                <ShieldCheckIcon weight="bold" />
                <Chip.Label>
                  {t('english.proxyActive', { max: formatRupiah(myProxyMax) })}
                </Chip.Label>
              </Chip>
            )}
            <MoneyInput
              id="proxy"
              label={t('english.proxyMax')}
              value={proxyMax}
              onChange={setProxyMax}
            />
            <Button
              fullWidth
              variant="tertiary"
              isPending={setProxy.isPending}
              isDisabled={proxyMax < min}
              onPress={() =>
                setProxy.mutate(proxyMax, {
                  onSuccess: () =>
                    toast.success(t('english.proxySuccess', { max: formatRupiah(proxyMax) })),
                })
              }
            >
              {t('english.proxySet')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
