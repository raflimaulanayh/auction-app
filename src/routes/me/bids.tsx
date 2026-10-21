import { Chip, Skeleton } from '@heroui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuctionVisual, Countdown, TypeChip } from '../../components/auction-bits'
import { EmptyState } from '../../components/AuctionCard'
import { requireAuth } from '../../lib/guard'
import { formatRupiah } from '../../lib/money'
import type { MyBidState } from '../../services/auctionService'
import { useMyBids } from '../../services/queries'

export const Route = createFileRoute('/me/bids')({ beforeLoad: requireAuth, component: MyBidsPage })

const STATE_COLOR: Record<MyBidState, 'success' | 'danger' | 'accent' | 'default' | 'warning'> = {
  leading: 'success',
  outbid: 'danger',
  won: 'success',
  lost: 'default',
  sealed: 'accent',
}

type Tab = 'active' | 'won' | 'lost'
const TAB_STATES: Record<Tab, MyBidState[]> = {
  active: ['leading', 'outbid', 'sealed'],
  won: ['won'],
  lost: ['lost'],
}

function MyBidsPage() {
  const { t } = useTranslation()
  const { data, isPending } = useMyBids()
  const [tab, setTab] = useState<Tab>('active')
  const rows = (data ?? []).filter((r) => TAB_STATES[tab].includes(r.state))
  const tabs: [Tab, string][] = [
    ['active', t('me.tabActive')],
    ['won', t('me.tabWon')],
    ['lost', t('me.tabLost')],
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t('me.bidsTitle')}</h1>
      <div className="inline-flex rounded-full border border-border bg-surface p-1">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === id ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'
            }`}
          >
            {label} ({(data ?? []).filter((r) => TAB_STATES[id].includes(r.state)).length})
          </button>
        ))}
      </div>
      {isPending ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState message={t('me.emptyBids')} />
      ) : (
        <ul className="space-y-3">
          {rows.map(({ auction, myTop, state }) => (
            <li key={auction.id}>
              <Link
                to="/auctions/$auctionId"
                params={{ auctionId: auction.id }}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 transition hover:border-foreground"
              >
                <AuctionVisual
                  category={auction.category}
                  className="size-20 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-semibold">{auction.title}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeChip type={auction.type} />
                    <Chip size="sm" variant="primary" color={STATE_COLOR[state]}>
                      {t(`me.${state}`)}
                    </Chip>
                  </div>
                  <p className="text-xs text-muted">
                    {t('me.myTop')}:{' '}
                    <span className="tabular font-semibold text-foreground">
                      {formatRupiah(myTop)}
                    </span>
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="tabular font-bold">{formatRupiah(auction.displayPrice)}</p>
                  <Countdown auction={auction} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
