import { Skeleton } from '@heroui/react'
import { FunnelSimpleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { AuctionGrid, EmptyState } from '../../components/AuctionCard'
import { useAuctions } from '../../services/queries'

const searchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['english', 'dutch', 'sealed']).optional(),
  status: z.enum(['upcoming', 'live', 'ended']).optional(),
  category: z
    .enum(['electronics', 'watches', 'art', 'vehicles', 'collectibles', 'fashion'])
    .optional(),
  sort: z.enum(['ending', 'newest', 'price-asc', 'price-desc']).optional(),
})

export const Route = createFileRoute('/auctions/')({
  validateSearch: searchSchema,
  component: AuctionsPage,
})

type Search = z.infer<typeof searchSchema>

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-accent bg-accent text-accent-foreground'
          : 'border-border bg-surface text-muted hover:border-accent hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function AuctionsPage() {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data, isPending } = useAuctions(search)
  const set = (patch: Partial<Search>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })

  const types = ['english', 'dutch', 'sealed'] as const
  const statuses = ['live', 'upcoming', 'ended'] as const
  const categories = [
    'electronics',
    'watches',
    'art',
    'vehicles',
    'collectibles',
    'fashion',
  ] as const
  const sorts = [
    ['ending', t('list.sortEnding')],
    ['newest', t('list.sortNewest')],
    ['price-asc', t('list.sortPriceAsc')],
    ['price-desc', t('list.sortPriceDesc')],
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('list.title')}</h1>
          <p className="text-sm text-muted">{t('list.results', { count: data?.length ?? 0 })}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            defaultValue={search.q}
            onChange={(e) => set({ q: e.target.value || undefined })}
            placeholder={t('common.search')}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <FunnelSimpleIcon className="shrink-0 text-muted" />
          <Pill active={!search.type} onClick={() => set({ type: undefined })}>
            {t('list.allTypes')}
          </Pill>
          {types.map((type) => (
            <Pill key={type} active={search.type === type} onClick={() => set({ type })}>
              {t(`type.${type}`)}
            </Pill>
          ))}
          <span className="mx-1 h-6 w-px shrink-0 bg-border" />
          <Pill active={!search.status} onClick={() => set({ status: undefined })}>
            {t('list.allStatus')}
          </Pill>
          {statuses.map((status) => (
            <Pill key={status} active={search.status === status} onClick={() => set({ status })}>
              {t(`status.${status}`)}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Pill active={!search.category} onClick={() => set({ category: undefined })}>
              {t('category.all')}
            </Pill>
            {categories.map((category) => (
              <Pill
                key={category}
                active={search.category === category}
                onClick={() => set({ category })}
              >
                {t(`category.${category}`)}
              </Pill>
            ))}
          </div>
          <select
            value={search.sort ?? 'ending'}
            onChange={(e) => set({ sort: e.target.value as Search['sort'] })}
            className="h-9 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-accent"
          >
            {sorts.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : data?.length ? (
        <AuctionGrid auctions={data} />
      ) : (
        <EmptyState message={t('list.noResults')} />
      )}
    </div>
  )
}
