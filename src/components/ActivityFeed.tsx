import { LockKeyIcon, RobotIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { formatRupiah } from '../lib/money'
import { dateLocale, useNow } from '../lib/time'
import { useRecentActivity } from '../services/queries'
import { TypeChip } from './auction-bits'
import { ScriptNote } from './brand'
import { AuctionThumb } from './media'

/** Live feed of the latest bids across the platform, so the demo feels busy. */
export function ActivityFeed() {
  const { t } = useTranslation()
  const { data = [] } = useRecentActivity()
  useNow()

  return (
    <section className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
      <div className="space-y-3 md:sticky md:top-28">
        <ScriptNote>{t('activity.note')}</ScriptNote>
        <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-4xl">
          {t('activity.title')}
        </h2>
        <p className="flex items-center gap-2 text-sm font-bold text-muted">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-danger" />
          </span>
          {t('activity.live')}
        </p>
      </div>

      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {data.map(({ bid, auction }) => (
            <motion.li
              key={bid.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <Link
                to="/auctions/$auctionId"
                params={{ auctionId: auction.id }}
                className="flex items-center gap-4 rounded-2xl border-2 border-ink bg-surface p-3 shadow-[4px_4px_0_var(--card-shadow)] transition hover:-translate-y-0.5"
              >
                <AuctionThumb
                  images={auction.images}
                  category={auction.category}
                  alt={auction.title}
                  className="size-14 shrink-0 rounded-xl border-2 border-ink"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-extrabold">{bid.userName}</span>{' '}
                    {auction.type === 'sealed' ? t('activity.sealedBid') : t('activity.bid')}
                    {bid.isProxy && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-accent-soft px-1.5 text-[10px] font-bold uppercase">
                        <RobotIcon /> {t('auction.auto')}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted">{auction.title}</p>
                </div>
                <div className="shrink-0 space-y-1 text-right">
                  {auction.type === 'sealed' ? (
                    <p className="flex items-center justify-end gap-1 text-sm font-extrabold">
                      <LockKeyIcon weight="bold" /> •••
                    </p>
                  ) : (
                    <p className="tabular text-sm font-extrabold">{formatRupiah(bid.amount)}</p>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <span className="hidden sm:block">
                      <TypeChip type={auction.type} />
                    </span>
                    <span className="text-[11px] text-muted">
                      {formatDistanceToNow(bid.at, { addSuffix: true, locale: dateLocale() })}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
