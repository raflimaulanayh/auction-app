import { Avatar, Button, Card, Chip, Skeleton, toast } from '@heroui/react'
import {
  ArrowLeftIcon,
  ClockCounterClockwiseIcon,
  HeartIcon,
  RobotIcon,
  StorefrontIcon,
  TimerIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { AuctionVisual, Countdown, StatusChip, TypeChip } from '../../components/auction-bits'
import { EmptyState } from '../../components/AuctionCard'
import { AnimatedPrice } from '../../components/motion/AnimatedPrice'
import { DutchPanel } from '../../features/auctions/DutchPanel'
import { EnglishPanel } from '../../features/auctions/EnglishPanel'
import { SealedPanel } from '../../features/auctions/SealedPanel'
import { auctionStatus, dutchPrice, resolveSealed } from '../../lib/auction-rules'
import { formatRupiah } from '../../lib/money'
import { useRealtime } from '../../lib/realtime'
import { dateLocale, useNow } from '../../lib/time'
import { useSession } from '../../services/authService'
import type { AuctionDetail } from '../../services/auctionService'
import { useAuction, useToggleWatch } from '../../services/queries'

export const Route = createFileRoute('/auctions/$auctionId')({ component: AuctionPage })

function PriceBlock({ detail }: { detail: AuctionDetail }) {
  const { t } = useTranslation()
  const now = useNow()
  const { auction, bidCount } = detail
  const status = auctionStatus(auction, now)

  let label = t('auction.currentBid')
  let price = auction.currentPrice
  if (auction.type === 'dutch') {
    label = t('dutch.priceNow')
    price = dutchPrice(auction, now)
  } else if (auction.type === 'sealed' || bidCount === 0) {
    label = t('auction.startingPrice')
    price = auction.startingPrice
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="relative text-3xl font-extrabold tracking-tight">
          <span key={price} aria-hidden className="flash absolute inset-0 -mx-1 rounded-md" />
          <AnimatedPrice
            className="relative"
            value={price}
            from={auction.type === 'dutch' ? auction.startingPrice : auction.startingPrice * 0.9}
          />
        </p>
      </div>
      <div className="text-right">
        <p className="flex items-center justify-end gap-1 text-xs text-muted">
          <TimerIcon />
          {status === 'upcoming'
            ? t('auction.startsIn')
            : status === 'live'
              ? t('auction.endsIn')
              : t('status.ended')}
        </p>
        {status === 'ended' ? (
          <p className="text-sm font-medium">
            {t('auction.endedAt', {
              when: formatDistanceToNow(auction.soldAt ?? auction.endsAt, {
                addSuffix: true,
                locale: dateLocale(),
              }),
            })}
          </p>
        ) : (
          <Countdown auction={auction} large />
        )}
      </div>
    </div>
  )
}

function EndedSummary({ detail }: { detail: AuctionDetail }) {
  const { t } = useTranslation()
  const { auction, bids } = detail
  if (auction.type === 'sealed') return null
  const winner = auction.winnerId ? bids.find((b) => b.userId === auction.winnerId) : bids[0]
  const reserveOk = !auction.reservePrice || auction.currentPrice >= auction.reservePrice
  if (auction.type === 'dutch' && auction.soldAt && winner) {
    return (
      <div className="rounded-xl bg-success-soft p-3 text-sm font-medium text-success-soft-foreground">
        {t('dutch.sold', { name: winner.userName, price: formatRupiah(auction.currentPrice) })}
      </div>
    )
  }
  return (
    <div className="rounded-xl bg-surface-secondary p-3 text-sm font-medium">
      {winner && reserveOk
        ? t('english.wonBy', { name: winner.userName, price: formatRupiah(auction.currentPrice) })
        : t('english.noWinner')}
    </div>
  )
}

function BidHistory({ detail }: { detail: AuctionDetail }) {
  const { t } = useTranslation()
  const user = useSession((s) => s.user)
  useNow()
  if (detail.auction.type === 'dutch') return null
  const hidden = detail.auction.type === 'sealed' && !detail.sealedResult
  const rows =
    detail.auction.type === 'sealed'
      ? detail.sealedResult
        ? resolveSealed(detail.auction, detail.bids).ranking
        : []
      : detail.bids

  return (
    <Card>
      <Card.Header className="flex-row items-center justify-between">
        <Card.Title className="flex items-center gap-2">
          <ClockCounterClockwiseIcon weight="bold" /> {t('auction.history')}
        </Card.Title>
        <span className="flex items-center gap-1 text-xs text-muted">
          <UsersIcon /> {t('auction.participants', { count: detail.participantCount })}
        </span>
      </Card.Header>
      <Card.Content>
        {hidden ? (
          <p className="text-sm text-muted">{t('sealed.hiddenInfo')}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted">{t('auction.noBids')}</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.slice(0, 12).map((b, i) => (
              <li
                key={b.id}
                className={`flex items-center justify-between py-2.5 ${i === 0 ? 'flash' : ''}`}
              >
                <span className="flex items-center gap-2.5 text-sm">
                  <Avatar size="sm" color={b.userId === user?.id ? 'accent' : 'default'}>
                    <Avatar.Fallback>{b.userName.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                  <span>
                    <span className="font-medium">
                      {b.userId === user?.id ? t('common.you') : b.userName}
                    </span>
                    {b.isProxy && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-accent-soft px-1.5 text-[10px] font-semibold uppercase text-brand">
                        <RobotIcon /> {t('auction.auto')}
                      </span>
                    )}
                    <span className="block text-xs text-muted">
                      {formatDistanceToNow(b.at, { addSuffix: true, locale: dateLocale() })}
                    </span>
                  </span>
                </span>
                <span className={`tabular text-sm font-bold ${i === 0 ? 'text-success' : ''}`}>
                  {formatRupiah(b.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card.Content>
    </Card>
  )
}

function AuctionPage() {
  const { t } = useTranslation()
  const { auctionId } = Route.useParams()
  const { data: detail, isPending, isError } = useAuction(auctionId)
  const user = useSession((s) => s.user)
  const now = useNow()
  const toggleWatch = useToggleWatch(auctionId)

  useRealtime((e) => {
    if (e.type === 'AuctionExtended' && e.auctionId === auctionId)
      toast.info(t('auction.extendedToast'))
  })

  if (isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <Skeleton className="aspect-[4/3] rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    )
  }
  if (isError || !detail) return <EmptyState message={t('auction.notFound')} />

  const { auction } = detail
  const status = auctionStatus(auction, now)
  const live = status === 'live'

  let panel: React.ReactNode
  if (!user) {
    panel = live ? (
      <Link to="/login" search={{ redirect: `/auctions/${auction.id}` }}>
        <Button fullWidth size="lg">
          {t('auction.loginToBid')}
        </Button>
      </Link>
    ) : null
  } else if (user.id === auction.sellerId) {
    panel = (
      <p className="rounded-xl bg-surface-secondary p-3 text-sm text-muted">
        {t('auction.ownAuction')}
      </p>
    )
  } else if (auction.type === 'english') {
    panel = <EnglishPanel detail={detail} user={user} live={live} />
  } else if (auction.type === 'dutch') {
    panel = <DutchPanel detail={detail} live={live} />
  }
  if (auction.type === 'sealed' && (user?.id !== auction.sellerId || detail.sealedResult)) {
    panel = <SealedPanel detail={detail} user={user ?? undefined} live={live} />
  }

  return (
    <div className="space-y-6">
      <Link
        to="/auctions"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeftIcon /> {t('common.back')}
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <AuctionVisual
            category={auction.category}
            className="aspect-[4/3] rounded-3xl border-2 border-ink shadow-[6px_6px_0_var(--card-shadow)]"
          />
          <Card>
            <Card.Header>
              <Card.Title>{t('auction.description')}</Card.Title>
            </Card.Header>
            <Card.Content className="gap-4">
              <p className="text-sm leading-relaxed text-muted">{auction.description}</p>
              <div className="flex items-center gap-3 rounded-xl bg-surface-secondary p-3">
                <StorefrontIcon weight="duotone" className="size-6 text-brand" />
                <div>
                  <p className="text-xs text-muted">{t('auction.seller')}</p>
                  <p className="text-sm font-semibold">{auction.sellerName}</p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5 sm:p-6">
            <Card.Header className="gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip auction={auction} />
                <TypeChip type={auction.type} />
                <span className="text-xs text-muted">{t(`category.${auction.category}`)}</span>
                {auction.extendedCount > 0 && (
                  <Chip size="sm" color="warning" variant="primary">
                    {t('auction.extended', { count: auction.extendedCount })}
                  </Chip>
                )}
              </div>
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
                {auction.title}
              </h1>
            </Card.Header>
            <Card.Content className="gap-5">
              <PriceBlock detail={detail} />
              {auction.type === 'english' && live && (
                <p className="text-xs text-muted">⏱ {t('auction.antiSnipingInfo')}</p>
              )}
              {status === 'ended' && <EndedSummary detail={detail} />}
              {panel}
              {user && (
                <Button
                  variant={detail.watched ? 'secondary' : 'ghost'}
                  fullWidth
                  onPress={() => toggleWatch.mutate()}
                >
                  <HeartIcon
                    weight={detail.watched ? 'fill' : 'regular'}
                    className={detail.watched ? 'text-danger' : ''}
                  />
                  {detail.watched ? t('auction.watching') : t('auction.watch')}
                </Button>
              )}
            </Card.Content>
          </Card>
          <BidHistory detail={detail} />
        </div>
      </div>
    </div>
  )
}
