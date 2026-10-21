import { Button } from '@heroui/react'
import {
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  EyeSlashIcon,
  LightningIcon,
  TimerIcon,
  TrendDownIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dutchNextDropIn, dutchPrice } from '../lib/auction-rules'
import { formatRupiah } from '../lib/money'
import { useNow } from '../lib/time'
import type { AuctionSummary } from '../services/auctionService'
import { useAuctions } from '../services/queries'
import { AuctionVisual, Countdown } from './auction-bits'

const AUTOPLAY_MS = 6000

const ctaPrimary = 'bg-white text-slate-900'
const ctaGhost = 'text-white hover:bg-white/15'

function Eyebrow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
      {icon} {children}
    </span>
  )
}

function SlideFrame({
  gradient,
  children,
  aside,
}: {
  gradient: string
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div
      className={`relative h-full overflow-hidden bg-gradient-to-br ${gradient} px-6 py-12 text-white sm:px-12`}
    >
      <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-black/10 blur-3xl" />
      <div className="relative grid h-full items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="max-w-2xl space-y-5">{children}</div>
        {aside && <div className="hidden md:block">{aside}</div>}
      </div>
    </div>
  )
}

function AuctionAside({
  auction,
  label,
  price,
}: {
  auction: AuctionSummary
  label: string
  price: number
}) {
  return (
    <div className="ml-auto max-w-sm overflow-hidden rounded-3xl bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur">
      <AuctionVisual category={auction.category} className="aspect-[16/10]" />
      <div className="space-y-1 p-5">
        <p className="line-clamp-1 text-sm font-semibold text-white/90">{auction.title}</p>
        <p className="text-xs text-white/70">{label}</p>
        <p key={price} className="flash tabular rounded-md text-2xl font-extrabold">
          {formatRupiah(price)}
        </p>
      </div>
    </div>
  )
}

function BrandSlide() {
  const { t } = useTranslation()
  return (
    <SlideFrame gradient="from-indigo-600 via-violet-600 to-fuchsia-600">
      <Eyebrow icon={<LightningIcon weight="fill" className="text-amber-300" />}>
        {t('common.tagline')}
      </Eyebrow>
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        {t('home.heroTitle')}
      </h1>
      <p className="text-base text-white/80 sm:text-lg">{t('home.heroSubtitle')}</p>
      <div className="flex flex-wrap gap-3">
        <Link to="/auctions">
          <Button size="lg" className={ctaPrimary}>
            {t('home.explore')} <ArrowRightIcon weight="bold" />
          </Button>
        </Link>
        <Link to="/sell/new">
          <Button size="lg" variant="ghost" className={ctaGhost}>
            {t('home.startSelling')}
          </Button>
        </Link>
      </div>
    </SlideFrame>
  )
}

function EndingSlide({ auction }: { auction: AuctionSummary }) {
  const { t } = useTranslation()
  return (
    <SlideFrame
      gradient="from-sky-600 via-blue-600 to-indigo-700"
      aside={
        <AuctionAside
          auction={auction}
          label={t('auction.currentBid')}
          price={auction.currentPrice}
        />
      }
    >
      <Eyebrow icon={<TimerIcon weight="fill" className="text-rose-300" />}>
        {t('hero.endingEyebrow')}
      </Eyebrow>
      <h2 className="line-clamp-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {auction.title}
      </h2>
      <div className="flex flex-wrap items-end gap-8">
        <div>
          <p className="text-xs text-white/70">{t('auction.currentBid')}</p>
          <p className="tabular text-3xl font-extrabold">{formatRupiah(auction.currentPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-white/70">{t('auction.endsIn')}</p>
          <Countdown auction={auction} large />
        </div>
      </div>
      <p className="text-sm text-white/80">{t('auction.antiSnipingInfo')}</p>
      <Link to="/auctions/$auctionId" params={{ auctionId: auction.id }}>
        <Button size="lg" className={ctaPrimary}>
          {t('hero.joinBid')} <ArrowRightIcon weight="bold" />
        </Button>
      </Link>
    </SlideFrame>
  )
}

function DutchSlide({ auction }: { auction: AuctionSummary }) {
  const { t } = useTranslation()
  const now = useNow()
  const price = dutchPrice(auction, now)
  const dropIn = Math.ceil(dutchNextDropIn(auction, now) / 1000)
  return (
    <SlideFrame
      gradient="from-amber-500 via-orange-600 to-rose-600"
      aside={<AuctionAside auction={auction} label={t('dutch.priceNow')} price={price} />}
    >
      <Eyebrow icon={<TrendDownIcon weight="bold" />}>{t('hero.dutchEyebrow')}</Eyebrow>
      <h2 className="line-clamp-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {auction.title}
      </h2>
      <div className="flex flex-wrap items-end gap-8">
        <div>
          <p className="text-xs text-white/70">{t('dutch.priceNow')}</p>
          <p key={price} className="flash tabular rounded-md text-3xl font-extrabold">
            {formatRupiah(price)}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/70">
            {t('dutch.nextDrop', { amount: formatRupiah(auction.decrement ?? 0, true) })}
          </p>
          <p className="tabular text-3xl font-extrabold">{dropIn}s</p>
        </div>
      </div>
      <p className="text-sm text-white/80">{t('hero.dutchHint')}</p>
      <Link to="/auctions/$auctionId" params={{ auctionId: auction.id }}>
        <Button size="lg" className={ctaPrimary}>
          {t('hero.grabIt')} <ArrowRightIcon weight="bold" />
        </Button>
      </Link>
    </SlideFrame>
  )
}

function SealedSlide({ auction }: { auction?: AuctionSummary }) {
  const { t } = useTranslation()
  return (
    <SlideFrame
      gradient="from-emerald-600 via-teal-600 to-cyan-700"
      aside={
        <div className="ml-auto max-w-sm space-y-3 rounded-3xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur">
          {[
            ['1', t('hero.sealedStep1')],
            ['2', t('hero.sealedStep2')],
            ['3', t('hero.sealedStep3')],
          ].map(([n, text]) => (
            <div key={n} className="flex items-start gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-teal-700">
                {n}
              </span>
              <p className="text-sm text-white/90">{text}</p>
            </div>
          ))}
        </div>
      }
    >
      <Eyebrow icon={<EyeSlashIcon weight="bold" />}>{t('type.sealed')}</Eyebrow>
      <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {t('hero.sealedTitle')}
      </h2>
      <p className="text-base text-white/80 sm:text-lg">{t('sealed.vickreyInfo')}</p>
      <Link
        {...(auction
          ? { to: '/auctions/$auctionId', params: { auctionId: auction.id } }
          : { to: '/auctions', search: { type: 'sealed' } })}
      >
        <Button size="lg" className={ctaPrimary}>
          {auction
            ? t('hero.sealedCta', { title: auction.title.split(' ').slice(0, 3).join(' ') })
            : t('common.seeAll')}
          <ArrowRightIcon weight="bold" />
        </Button>
      </Link>
    </SlideFrame>
  )
}

export function HeroSlider() {
  const { t } = useTranslation()
  const { data: live = [] } = useAuctions({ status: 'live' })
  const english = live.find((a) => a.type === 'english')
  const dutch = live.find((a) => a.type === 'dutch')
  const sealed = live.find((a) => a.type === 'sealed')

  const slides = [
    { id: 'brand', node: <BrandSlide /> },
    english && { id: 'ending', node: <EndingSlide auction={english} /> },
    dutch && { id: 'dutch', node: <DutchSlide auction={dutch} /> },
    { id: 'sealed', node: <SealedSlide auction={sealed} /> },
  ].filter((s): s is { id: string; node: React.JSX.Element } => !!s)

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const current = index % slides.length
  const go = (i: number) => setIndex((i + slides.length) % slides.length)

  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (paused || reducedMotion.current) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [index, paused, slides.length])

  const touchX = useRef<number | null>(null)

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('hero.label')}
      className="group relative overflow-hidden rounded-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(current - 1)
        if (e.key === 'ArrowRight') go(current + 1)
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1))
        touchX.current = null
      }}
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}`}
            aria-hidden={i !== current}
            inert={i !== current}
            className="min-h-[26rem] w-full shrink-0"
          >
            {s.node}
          </div>
        ))}
      </div>

      <button
        aria-label={t('hero.prev')}
        onClick={() => go(current - 1)}
        className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur transition hover:bg-black/40 group-hover:opacity-100 sm:grid"
      >
        <CaretLeftIcon weight="bold" />
      </button>
      <button
        aria-label={t('hero.next')}
        onClick={() => go(current + 1)}
        className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur transition hover:bg-black/40 group-hover:opacity-100 sm:grid"
      >
        <CaretRightIcon weight="bold" />
      </button>

      <div className="absolute bottom-5 left-6 flex gap-2 sm:left-12">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`${i + 1} / ${slides.length}`}
            aria-current={i === current}
            onClick={() => go(i)}
            className={`relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all ${i === current ? 'w-10' : 'w-4 hover:bg-white/50'}`}
          >
            {i === current && (
              <span
                key={`${index}-${paused}`}
                className="hero-progress absolute inset-y-0 left-0 rounded-full bg-white"
                style={{
                  animationDuration: `${AUTOPLAY_MS}ms`,
                  animationPlayState: paused ? 'paused' : 'running',
                }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
