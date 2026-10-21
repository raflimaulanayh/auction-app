import { Button, Card, Skeleton } from '@heroui/react'
import { CoinsIcon, GavelIcon, PlusIcon, PulseIcon } from '@phosphor-icons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AuctionGrid, EmptyState } from '../../components/AuctionCard'
import { auctionStatus } from '../../lib/auction-rules'
import { requireAuth } from '../../lib/guard'
import { formatRupiah } from '../../lib/money'
import { useSession } from '../../services/authService'
import { useSellerAuctions } from '../../services/queries'

export const Route = createFileRoute('/sell/')({
  beforeLoad: requireAuth,
  component: SellerDashboard,
})

function SellerDashboard() {
  const { t } = useTranslation()
  const user = useSession((s) => s.user)
  const { data, isPending } = useSellerAuctions()

  if (user?.role !== 'seller') return <EmptyState message={t('seller.onlySeller')} />

  const now = Date.now()
  const list = data ?? []
  const stats = [
    {
      label: t('seller.active'),
      value: String(list.filter((a) => auctionStatus(a, now) === 'live').length),
      icon: PulseIcon,
    },
    {
      label: t('seller.totalBids'),
      value: String(list.reduce((s, a) => s + a.bidCount, 0)),
      icon: GavelIcon,
    },
    {
      label: t('seller.revenue'),
      value: formatRupiah(
        list
          .filter((a) => a.soldAt || (auctionStatus(a, now) === 'ended' && a.bidCount))
          .reduce((s, a) => s + a.currentPrice, 0),
        true,
      ),
      icon: CoinsIcon,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('seller.dashboard')}</h1>
          <p className="text-sm text-muted">{user.name}</p>
        </div>
        <Link to="/sell/new">
          <Button>
            <PlusIcon weight="bold" /> {t('seller.create')}
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: StatIcon }) => (
          <Card key={label}>
            <Card.Content className="flex-row items-center gap-4 p-5">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                <StatIcon weight="duotone" className="size-6" />
              </span>
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="tabular text-2xl font-extrabold">{value}</p>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t('seller.myAuctions')}</h2>
        {isPending ? (
          <Skeleton className="h-80 rounded-2xl" />
        ) : list.length ? (
          <AuctionGrid auctions={list} />
        ) : (
          <EmptyState message={t('seller.empty')} />
        )}
      </section>
    </div>
  )
}
