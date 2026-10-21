import { Card } from '@heroui/react'
import { ClockIcon, GavelIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { auctionStatus, dutchPrice } from '../lib/auction-rules'
import { formatRupiah } from '../lib/money'
import { useNow } from '../lib/time'
import type { AuctionSummary } from '../services/auctionService'
import { AuctionVisual, Countdown, StatusChip, TypeChip } from './auction-bits'

export function AuctionCard({ auction }: { auction: AuctionSummary }) {
  const { t } = useTranslation()
  const now = useNow()
  const status = auctionStatus(auction, now)
  const price = auction.type === 'dutch' ? dutchPrice(auction, now) : auction.currentPrice
  const priceLabel =
    auction.type === 'sealed'
      ? t('auction.startingPrice')
      : auction.type === 'dutch'
        ? t('auction.currentPrice')
        : auction.bidCount > 0
          ? t('auction.currentBid')
          : t('auction.startingPrice')

  return (
    <Link to="/auctions/$auctionId" params={{ auctionId: auction.id }} className="group block">
      <Card className="h-full overflow-hidden p-0 transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="relative">
          <AuctionVisual
            category={auction.category}
            className="aspect-[4/3] transition group-hover:scale-[1.02]"
          />
          <div className="absolute left-3 top-3 flex gap-1.5 rounded-full bg-background/90 backdrop-blur">
            <StatusChip auction={auction} />
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-background/90 backdrop-blur">
            <TypeChip type={auction.type} />
          </div>
        </div>
        <Card.Content className="gap-3 p-4">
          <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug">
            {auction.title}
          </p>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-muted">{priceLabel}</p>
              <p className="tabular text-lg font-bold">{formatRupiah(price)}</p>
            </div>
            {auction.type !== 'dutch' && (
              <p className="flex items-center gap-1 text-xs text-muted">
                <GavelIcon />
                {t('auction.bids', { count: auction.bidCount })}
              </p>
            )}
          </div>
          {status !== 'ended' && (
            <div className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2 text-xs">
              <span className="flex items-center gap-1.5 text-muted">
                <ClockIcon weight="bold" />
                {status === 'upcoming' ? t('auction.startsIn') : t('auction.endsIn')}
              </span>
              <Countdown auction={auction} />
            </div>
          )}
        </Card.Content>
      </Card>
    </Link>
  )
}

export function AuctionGrid({ auctions }: { auctions: AuctionSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {auctions.map((a) => (
        <AuctionCard key={a.id} auction={a} />
      ))}
    </div>
  )
}

export function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center text-muted">
      {icon ?? <GavelIcon weight="duotone" className="size-10" />}
      <p className="text-sm">{message}</p>
    </div>
  )
}
