import { Skeleton } from '@heroui/react'
import { HeartIcon } from '@phosphor-icons/react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AuctionGrid, EmptyState } from '../../components/AuctionCard'
import { requireAuth } from '../../lib/guard'
import { useWatchlist } from '../../services/queries'

export const Route = createFileRoute('/me/watchlist')({
  beforeLoad: requireAuth,
  component: WatchlistPage,
})

function WatchlistPage() {
  const { t } = useTranslation()
  const { data, isPending } = useWatchlist()
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t('me.watchTitle')}</h1>
      {isPending ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : data?.length ? (
        <AuctionGrid auctions={data} />
      ) : (
        <EmptyState
          message={t('me.emptyWatch')}
          icon={<HeartIcon weight="duotone" className="size-10" />}
        />
      )}
    </div>
  )
}
