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

const CATEGORY_GRADIENT: Record<Category, string> = {
  electronics: 'from-sky-500/80 via-indigo-500/70 to-violet-600/80',
  watches: 'from-amber-400/80 via-orange-500/70 to-rose-500/80',
  art: 'from-fuchsia-500/80 via-pink-500/70 to-orange-400/80',
  vehicles: 'from-emerald-500/80 via-teal-500/70 to-cyan-600/80',
  collectibles: 'from-yellow-500/80 via-amber-600/70 to-stone-700/80',
  fashion: 'from-rose-400/80 via-red-500/70 to-purple-600/80',
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
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENT[category]} ${className}`}
    >
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-10 -left-6 size-36 rounded-full bg-black/10 blur-2xl" />
      <CategoryIcon
        weight="duotone"
        className="relative size-1/3 max-h-28 text-white drop-shadow-lg"
      />
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
