import { Card, Skeleton } from '@heroui/react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AuctionGrid } from '../components/AuctionCard'
import { TYPE_ICON } from '../components/auction-bits'
import { HeroSlider } from '../components/HeroSlider'
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
      <HeroSlider />

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
