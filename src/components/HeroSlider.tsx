import {
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  EyeSlashIcon,
  LockKeyIcon,
  RobotIcon,
  TimerIcon,
  TrendDownIcon,
} from '@phosphor-icons/react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'motion/react'
import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dutchNextDropIn, dutchPrice } from '../lib/auction-rules'
import { formatRupiah } from '../lib/money'
import { useNow } from '../lib/time'
import type { AuctionSummary } from '../services/auctionService'
import { useAuctions } from '../services/queries'
import { AuctionVisual, Countdown } from './auction-bits'
import { Marker } from './brand'
import { AnimatedPrice } from './motion/AnimatedPrice'
import { LinkButton } from './LinkButton'

const GavelScene = lazy(() => import('./three/GavelScene'))

const AUTOPLAY_MS = 7000

type Tone = 'dark' | 'light'

/** Whether the slide is on screen (drives entrance animations) + shared pointer position. */
const SlideContext = createContext<{
  active: boolean
  px: MotionValue<number>
  py: MotionValue<number>
} | null>(null)

const content: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 140, damping: 20 },
  },
}

function Eyebrow({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-bold ${tone === 'dark' ? 'text-lime' : 'text-brand'}`}
    >
      {children}
      <span className="h-0.5 w-8 rounded-full bg-current" />
    </span>
  )
}

function SlideFrame({
  tone,
  surface,
  children,
  aside,
}: {
  tone: Tone
  surface: string
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  const ctx = useContext(SlideContext)!
  const state = ctx.active ? 'show' : 'hidden'
  // Aside floats against the pointer for depth.
  const ax = useTransform(ctx.px, (v) => v * -18)
  const ay = useTransform(ctx.py, (v) => v * -12)
  return (
    <div
      className={`relative h-full overflow-hidden px-6 pb-16 pt-12 sm:px-12 ${surface} ${tone === 'dark' ? 'text-paper' : 'text-ink'}`}
    >
      <div className="hero-grain pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" />
      <div className="relative grid h-full items-center gap-10 md:grid-cols-[1.25fr_1fr]">
        <motion.div
          variants={content}
          initial="hidden"
          animate={state}
          className="max-w-2xl space-y-5"
        >
          {(Array.isArray(children) ? children : [children]).map((child, i) => (
            <motion.div key={i} variants={item}>
              {child}
            </motion.div>
          ))}
        </motion.div>
        {aside && (
          <motion.div style={{ x: ax, y: ay }} className="hidden md:block">
            {aside}
          </motion.div>
        )}
      </div>
    </div>
  )
}

/** Brutalist card that drops in tilted, like the reference site's step cards. */
function TiltedCard({
  children,
  rotate,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  rotate: number
  delay?: number
  className?: string
}) {
  const ctx = useContext(SlideContext)!
  const hidden = { opacity: 0, y: 40, rotate: rotate * 3 }
  return (
    <motion.div
      initial={hidden}
      animate={ctx.active ? { opacity: 1, y: 0, rotate } : hidden}
      transition={{ type: 'spring', stiffness: 110, damping: 14, delay: 0.25 + delay }}
      whileHover={{ rotate: 0, scale: 1.03 }}
      className={`rounded-2xl border-2 border-ink bg-white text-ink shadow-[5px_5px_0_#0a0f0d] ${className}`}
    >
      {children}
    </motion.div>
  )
}

function StepPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border-2 border-ink bg-lime px-2.5 py-0.5 text-[11px] font-extrabold text-ink">
      {children}
    </span>
  )
}

function useDesktop3d() {
  const reduced = useReducedMotion()
  const [wide] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  return wide && !reduced
}

function BrandSlide({ liveCount }: { liveCount: number }) {
  const { t } = useTranslation()
  const ctx = useContext(SlideContext)!
  const show3d = useDesktop3d()
  return (
    <SlideFrame
      tone="dark"
      surface="grid-forest"
      aside={
        show3d ? (
          <div className="relative -my-10">
            <Suspense fallback={<div className="h-[22rem]" />}>
              <GavelScene active={ctx.active} />
            </Suspense>
            <p className="script absolute bottom-3 right-6 -rotate-3 text-xl text-lime">
              {t('hero.tapGavel')}
            </p>
          </div>
        ) : undefined
      }
    >
      <Eyebrow tone="dark">{t('common.tagline')}</Eyebrow>
      <h1 className="text-5xl font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-6xl">
        {t('home.heroTitleLead')} <Marker>{t('home.heroTitleMark')}</Marker>
      </h1>
      <p className="max-w-xl text-base text-paper/70 sm:text-lg">{t('home.heroSubtitle')}</p>
      <div className="flex flex-wrap items-center gap-5">
        <LinkButton to="/auctions" size="lg">
          {t('home.explore')} <ArrowRightIcon weight="bold" />
        </LinkButton>
        <a
          href="#how"
          className="group inline-flex items-center gap-2 font-extrabold text-paper underline decoration-lime decoration-[3px] underline-offset-[6px]"
        >
          {t('hero.peekCta')}
          <ArrowRightIcon weight="bold" className="transition group-hover:translate-x-1" />
        </a>
      </div>
      <p className="text-xs text-paper/60">{t('hero.trust', { count: liveCount })}</p>
    </SlideFrame>
  )
}

function EndingSlide({ auction }: { auction: AuctionSummary }) {
  const { t } = useTranslation()
  return (
    <SlideFrame
      tone="light"
      surface="bg-paper grid-paper"
      aside={
        <div className="relative mx-auto max-w-sm">
          <TiltedCard rotate={2} className="overflow-hidden">
            <AuctionVisual
              category={auction.category}
              className="aspect-[16/10] border-b-2 border-ink"
            />
            <div className="space-y-1 p-5">
              <StepPill>{t('auction.currentBid')}</StepPill>
              <p className="pt-1 text-2xl font-extrabold">
                <AnimatedPrice value={auction.currentPrice} />
              </p>
              <p className="line-clamp-1 text-sm text-muted">{auction.title}</p>
            </div>
          </TiltedCard>
          <div className="absolute -bottom-14 -left-6">
            <TiltedCard
              rotate={-4}
              delay={0.25}
              className="flex items-center gap-2 bg-lime px-4 py-3"
            >
              <RobotIcon weight="duotone" className="size-5" />
              <span className="script text-xl text-ink">{t('hero.autoBidSticky')}</span>
            </TiltedCard>
          </div>
        </div>
      }
    >
      <p className="script -rotate-1 text-[1.7rem]">{t('hero.endingNote')}</p>
      <h2 className="line-clamp-2 text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-5xl">
        {auction.title}
      </h2>
      <div className="flex flex-wrap items-end gap-5">
        <div className="rounded-2xl border-2 border-ink bg-white px-4 py-3 shadow-[4px_4px_0_#0a0f0d]">
          <p className="text-xs font-bold text-muted">{t('auction.currentBid')}</p>
          <p className="text-3xl font-extrabold">
            <AnimatedPrice value={auction.currentPrice} from={auction.startingPrice} />
          </p>
        </div>
        <div className="rounded-2xl border-2 border-ink bg-ink px-4 py-3 text-lime shadow-[4px_4px_0_#d6ee30]">
          <p className="flex items-center gap-1 text-xs font-bold text-paper/70">
            <TimerIcon weight="bold" /> {t('auction.endsIn')}
          </p>
          <Countdown auction={auction} large />
        </div>
      </div>
      <LinkButton to="/auctions/$auctionId" params={{ auctionId: auction.id }} size="lg">
        {t('hero.joinBid')} <ArrowRightIcon weight="bold" />
      </LinkButton>
    </SlideFrame>
  )
}

function DutchSlide({ auction }: { auction: AuctionSummary }) {
  const { t } = useTranslation()
  const now = useNow()
  const price = dutchPrice(auction, now)
  const floor = auction.floorPrice ?? 0
  const dropIn = Math.ceil(dutchNextDropIn(auction, now) / 1000)
  const dropped =
    ((auction.startingPrice - price) / Math.max(1, auction.startingPrice - floor)) * 100
  return (
    <SlideFrame
      tone="light"
      surface="bg-lime [--grid-line:rgb(10_15_13/0.08)] grid-paper"
      aside={
        <TiltedCard rotate={-2} className="mx-auto max-w-sm space-y-4 p-6">
          <div className="flex items-center justify-between">
            <StepPill>{t('dutch.priceNow')}</StepPill>
            <TrendDownIcon weight="bold" className="size-6" />
          </div>
          <p className="text-4xl font-extrabold">
            <AnimatedPrice value={price} from={auction.startingPrice} />
          </p>
          <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
            <motion.div
              className="h-full bg-ink"
              animate={{ width: `${dropped}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold text-muted">
            <span>{formatRupiah(auction.startingPrice, true)}</span>
            <span>
              {t('dutch.floor')} {formatRupiah(floor, true)}
            </span>
          </div>
        </TiltedCard>
      }
    >
      <p className="script -rotate-1 text-[1.7rem] text-ink/80">{t('hero.dutchNote')}</p>
      <h2 className="line-clamp-2 text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-5xl">
        {auction.title}
      </h2>
      <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-extrabold shadow-[3px_3px_0_#0a0f0d]">
        <TrendDownIcon weight="bold" />
        {t('dutch.nextDrop', { amount: formatRupiah(auction.decrement ?? 0, true) })}
        <span className="tabular">{dropIn}s</span>
      </p>
      <p className="max-w-lg text-ink/70">{t('hero.dutchHint')}</p>
      <LinkButton
        to="/auctions/$auctionId"
        params={{ auctionId: auction.id }}
        size="lg"
        className="bg-ink text-lime"
      >
        {t('hero.grabIt')} <ArrowRightIcon weight="bold" />
      </LinkButton>
    </SlideFrame>
  )
}

function SealedSlide({ auction }: { auction?: AuctionSummary }) {
  const { t } = useTranslation()
  const steps = [t('hero.sealedStep1'), t('hero.sealedStep2'), t('hero.sealedStep3')]
  return (
    <SlideFrame
      tone="dark"
      surface="grid-forest"
      aside={
        <div className="relative mx-auto flex max-w-sm flex-col gap-5">
          {steps.map((text, i) => (
            <div key={text} className={i === 1 ? 'ml-10' : ''}>
              <TiltedCard
                rotate={i % 2 ? 2 : -2}
                delay={i * 0.15}
                className={`space-y-2 p-4 ${i === 1 ? 'bg-lime' : ''}`}
              >
                <StepPill>
                  {t('hero.step')} {i + 1}
                </StepPill>
                <p className="text-sm font-bold leading-snug">{text}</p>
              </TiltedCard>
            </div>
          ))}
        </div>
      }
    >
      <Eyebrow tone="dark">
        <EyeSlashIcon weight="bold" /> {t('type.sealed')}
      </Eyebrow>
      <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-5xl">
        {t('hero.sealedTitleLead')} <Marker>{t('hero.sealedTitleMark')}</Marker>
      </h2>
      <p className="max-w-xl text-paper/70 sm:text-lg">{t('sealed.vickreyInfo')}</p>
      <LinkButton
        {...(auction
          ? { to: '/auctions/$auctionId', params: { auctionId: auction.id } }
          : { to: '/auctions', search: { type: 'sealed' } })}
        size="lg"
      >
        <LockKeyIcon weight="bold" />
        {auction
          ? t('hero.sealedCta', { title: auction.title.split(' ').slice(0, 3).join(' ') })
          : t('common.seeAll')}
      </LinkButton>
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
    { id: 'brand', tone: 'dark' as Tone, node: <BrandSlide liveCount={live.length} /> },
    english && { id: 'ending', tone: 'light' as Tone, node: <EndingSlide auction={english} /> },
    dutch && { id: 'dutch', tone: 'light' as Tone, node: <DutchSlide auction={dutch} /> },
    { id: 'sealed', tone: 'dark' as Tone, node: <SealedSlide auction={sealed} /> },
  ].filter((s): s is { id: string; tone: Tone; node: React.JSX.Element } => !!s)

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const current = index % slides.length
  const tone = slides[current]?.tone ?? 'dark'
  const go = (i: number) => setIndex((i + slides.length) % slides.length)

  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (paused || reducedMotion) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [index, paused, slides.length, reducedMotion])

  const touchX = useRef<number | null>(null)
  const px = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 })
  const py = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 })

  const arrow =
    'absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border-2 border-ink bg-white text-ink opacity-0 shadow-[3px_3px_0_#0a0f0d] transition group-hover:opacity-100 sm:grid'

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('hero.label')}
      className="group relative overflow-hidden rounded-[2rem] border-2 border-ink shadow-[6px_6px_0_#0a0f0d] dark:shadow-[6px_6px_0_#000]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false)
        px.set(0)
        py.set(0)
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width - 0.5)
        py.set((e.clientY - r.top) / r.height - 0.5)
      }}
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
            className="min-h-[30rem] w-full shrink-0"
          >
            <SlideContext.Provider value={{ active: i === current, px, py }}>
              {s.node}
            </SlideContext.Provider>
          </div>
        ))}
      </div>

      <button
        aria-label={t('hero.prev')}
        onClick={() => go(current - 1)}
        className={`${arrow} left-4`}
      >
        <CaretLeftIcon weight="bold" />
      </button>
      <button
        aria-label={t('hero.next')}
        onClick={() => go(current + 1)}
        className={`${arrow} right-4`}
      >
        <CaretRightIcon weight="bold" />
      </button>

      <div className="absolute bottom-5 left-6 flex items-center gap-2 sm:left-12">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`${i + 1} / ${slides.length}`}
            aria-current={i === current}
            onClick={() => go(i)}
            className={`relative h-2 overflow-hidden rounded-full transition-all ${
              tone === 'dark' ? 'bg-paper/25' : 'bg-ink/20'
            } ${i === current ? 'w-12' : 'w-4'}`}
          >
            {i === current && (
              <span
                key={`${index}-${paused}`}
                className={`hero-progress absolute inset-y-0 left-0 rounded-full ${tone === 'dark' ? 'bg-lime' : 'bg-ink'}`}
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
