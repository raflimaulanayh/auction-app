import { Skeleton } from '@heroui/react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { AuctionGrid } from '../components/AuctionCard'
import { TYPE_ICON } from '../components/auction-bits'
import { Display, Marker, ScriptNote } from '../components/brand'
import { HeroSlider } from '../components/HeroSlider'
import { HowItWorks } from '../components/HowItWorks'
import { auctionStatus } from '../lib/auction-rules'
import { useAuctions } from '../services/queries'
import type { AuctionType } from '../types'

export const Route = createFileRoute('/')({ component: HomePage })

function SectionHeader({
  note,
  title,
  type,
}: {
  note: string
  title: React.ReactNode
  type: AuctionType
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        <ScriptNote>{note}</ScriptNote>
        <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-4xl">
          {title}
        </h2>
      </div>
      <Link
        to="/auctions"
        search={{ type }}
        className="group inline-flex items-center gap-2 font-extrabold underline decoration-lime decoration-[3px] underline-offset-[6px]"
      >
        {t('common.seeAll')}
        <ArrowRightIcon weight="bold" className="transition group-hover:translate-x-1" />
      </Link>
    </div>
  )
}

function AuctionRow({
  type,
  note,
  title,
}: {
  type: AuctionType
  note: string
  title: React.ReactNode
}) {
  const { data, isPending } = useAuctions({ type, status: 'live' })
  return (
    <section className="space-y-6">
      <SectionHeader note={note} title={title} type={type} />
      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : (
        <AuctionGrid auctions={(data ?? []).slice(0, 4)} />
      )}
    </section>
  )
}

function Stats() {
  const { t } = useTranslation()
  const { data = [] } = useAuctions({})
  const now = Date.now()
  const stats = [
    {
      value: data.filter((a) => auctionStatus(a, now) === 'live').length,
      label: t('home.statLive'),
    },
    { value: data.reduce((s, a) => s + a.bidCount, 0), label: t('home.statBids') },
    { value: 3, label: t('home.statTypes') },
  ]
  return (
    <section className="grid gap-6 sm:grid-cols-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="border-t-2 border-foreground pt-4"
        >
          <p className="tabular text-4xl font-extrabold tracking-[-0.04em]">{s.value}</p>
          <p className="text-sm text-muted">{s.label}</p>
        </motion.div>
      ))}
    </section>
  )
}

function Formats() {
  const { t } = useTranslation()
  const types: AuctionType[] = ['english', 'dutch', 'sealed']
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <ScriptNote>{t('home.formatsNote')}</ScriptNote>
        <Display>
          {t('home.formatsLead')} <Marker>{t('home.formatsMark')}</Marker>
        </Display>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {types.map((type, i) => {
          const TypeIcon = TYPE_ICON[type]
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 40, rotate: i % 2 ? 2 : -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: i === 1 ? 1 : -1 }}
              whileHover={{ rotate: 0, y: -4 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: i * 0.1 }}
            >
              <Link
                to="/auctions"
                search={{ type }}
                className={`grid-paper block h-full space-y-4 rounded-2xl border-2 border-ink p-6 text-ink shadow-[5px_5px_0_#0a0f0d] ${i === 1 ? 'bg-lime [--grid-line:rgb(10_15_13/0.08)]' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border-2 border-ink bg-lime px-2.5 py-0.5 text-[11px] font-extrabold">
                    {t('hero.step')} 0{i + 1}
                  </span>
                  <TypeIcon weight="bold" className="size-6" />
                </div>
                <p className="text-2xl font-extrabold tracking-[-0.03em]">{t(`type.${type}`)}</p>
                <p className="text-sm text-ink/70">{t(`type.${type}Desc`)}</p>
                <span className="inline-flex items-center gap-1 text-sm font-extrabold">
                  {t('common.seeAll')} <ArrowRightIcon weight="bold" />
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function HomePage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-24">
      <HeroSlider />
      <Stats />
      <Formats />
      <AuctionRow
        type="english"
        note={t('home.endingNote')}
        title={
          <>
            {t('home.endingLead')} <Marker>{t('home.endingMark')}</Marker>
          </>
        }
      />
      <HowItWorks />
      <AuctionRow
        type="dutch"
        note={t('home.dutchNote')}
        title={
          <>
            {t('home.dutchLead')} <Marker>{t('home.dutchMark')}</Marker>
          </>
        }
      />
      <AuctionRow
        type="sealed"
        note={t('home.sealedNote')}
        title={
          <>
            {t('home.sealedLead')} <Marker>{t('home.sealedMark')}</Marker>
          </>
        }
      />
    </div>
  )
}
