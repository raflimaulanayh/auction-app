import { Button, Card, Skeleton } from '@heroui/react'
import { ArrowRightIcon, LightningIcon } from '@phosphor-icons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AuctionGrid } from '../components/AuctionCard'
import { TYPE_ICON } from '../components/auction-bits'
import { useAuctions } from '../services/queries'
import type { AuctionType } from '../types'

export const Route = createFileRoute('/')({ component: HomePage })

function Section({ title, type }: { title: string; type: AuctionType }) {
  const { t } = useTranslation()
  const { data, isPending } = useAuctions({ type, status: 'live' })
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <Link
          to="/auctions"
          search={{ type }}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {t('common.seeAll')} <ArrowRightIcon />
        </Link>
      </div>
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

function HomePage() {
  const { t } = useTranslation()
  const types: AuctionType[] = ['english', 'dutch', 'sealed']

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-14 text-white sm:px-12">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative max-w-2xl space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <LightningIcon weight="fill" className="text-amber-300" /> {t('common.tagline')}
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {t('home.heroTitle')}
          </h1>
          <p className="text-base text-white/80 sm:text-lg">{t('home.heroSubtitle')}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auctions">
              <Button size="lg" className="bg-white text-indigo-700">
                {t('home.explore')} <ArrowRightIcon weight="bold" />
              </Button>
            </Link>
            <Link to="/sell/new">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/15">
                {t('home.startSelling')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {types.map((type) => {
          const TypeIcon = TYPE_ICON[type]
          return (
            <Link key={type} to="/auctions" search={{ type }}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                <Card.Header className="flex-row items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
                    <TypeIcon weight="duotone" className="size-6" />
                  </span>
                  <Card.Title>{t(`type.${type}`)}</Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className="text-sm text-muted">{t(`type.${type}Desc`)}</p>
                </Card.Content>
              </Card>
            </Link>
          )
        })}
      </section>

      <Section title={t('home.endingSoon')} type="english" />
      <Section title={t('home.dutchLive')} type="dutch" />
      <Section title={t('home.sealedOpen')} type="sealed" />
    </div>
  )
}
