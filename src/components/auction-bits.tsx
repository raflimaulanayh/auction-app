import { Chip } from '@heroui/react'
import {
  CarIcon,
  CoinsIcon,
  DeviceMobileIcon,
  EyeSlashIcon,
  PaintBrushIcon,
  TShirtIcon,
  TrendDownIcon,
  TrendUpIcon,
  WatchIcon,
  type Icon,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { auctionStatus } from '../lib/auction-rules'
import { splitDuration, useNow } from '../lib/time'
import type { Auction, AuctionType, Category } from '../types'

const CATEGORY_ICON: Record<Category, Icon> = {
  electronics: DeviceMobileIcon,
  watches: WatchIcon,
  art: PaintBrushIcon,
  vehicles: CarIcon,
  collectibles: CoinsIcon,
  fashion: TShirtIcon,
}

// Flat, earthy tints that sit well next to the forest/lime brand palette.
const CATEGORY_TINT: Record<Category, string> = {
  electronics: 'bg-[#c9e6d6]',
  watches: 'bg-[#f4e3b5]',
  art: 'bg-[#f6d0d4]',
  vehicles: 'bg-[#cfe0f5]',
  collectibles: 'bg-lime-soft',
  fashion: 'bg-[#e5d9f2]',
}

export const TYPE_ICON: Record<AuctionType, Icon> = {
  english: TrendUpIcon,
  dutch: TrendDownIcon,
  sealed: EyeSlashIcon,
}

/** Placeholder product visual until the API serves real photos. */
export function AuctionVisual({
  category,
  className = '',
}: {
  category: Category
  className?: string
}) {
  const CategoryIcon = CATEGORY_ICON[category]
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${CATEGORY_TINT[category]} ${className}`}
    >
      <div className="absolute inset-0 [--grid-line:rgb(18_41_34/0.08)] grid-paper" />
      <div className="relative grid size-2/5 max-h-32 max-w-32 -rotate-3 place-items-center rounded-2xl border-2 border-ink bg-white shadow-[4px_4px_0_#0a0f0d] transition-transform duration-300 group-hover:rotate-2">
        <CategoryIcon weight="duotone" className="size-1/2 text-ink" />
      </div>
    </div>
  )
}

export function TypeChip({ type, size = 'sm' }: { type: AuctionType; size?: 'sm' | 'md' }) {
  const { t } = useTranslation()
  const TypeIcon = TYPE_ICON[type]
  const color = type === 'english' ? 'accent' : type === 'dutch' ? 'warning' : 'default'
  return (
    <Chip size={size} color={color} variant="soft">
      <TypeIcon weight="bold" />
      <Chip.Label>{t(`type.${type}`)}</Chip.Label>
    </Chip>
  )
}

export function StatusChip({ auction }: { auction: Auction }) {
  const { t } = useTranslation()
  const now = useNow()
  const status = auctionStatus(auction, now)
  if (auction.soldAt) {
    return (
      <Chip size="sm" color="success" variant="primary">
        {t('status.sold')}
      </Chip>
    )
  }
  return (
    <Chip
      size="sm"
      color={status === 'live' ? 'danger' : status === 'upcoming' ? 'accent' : 'default'}
      variant={status === 'live' ? 'primary' : 'soft'}
    >
      {status === 'live' && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
      <Chip.Label>{t(`status.${status}`)}</Chip.Label>
    </Chip>
  )
}

/** Countdown to the next relevant moment: start for upcoming, end for live auctions. */
export function Countdown({ auction, large = false }: { auction: Auction; large?: boolean }) {
  const now = useNow()
  const status = auctionStatus(auction, now)
  const target = status === 'upcoming' ? auction.startsAt : auction.endsAt
  const { days, hours, minutes, seconds } = splitDuration(target - now)
  const urgent = status === 'live' && target - now < 60_000
  const pad = (n: number) => String(n).padStart(2, '0')

  if (status === 'ended') return <span className="text-muted">—</span>

  const text =
    days > 0
      ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return (
    <span
      className={`tabular font-semibold ${large ? 'text-3xl tracking-tight' : 'text-sm'} ${urgent ? 'animate-pulse text-danger' : ''}`}
    >
      {text}
    </span>
  )
}
