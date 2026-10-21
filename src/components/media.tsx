import { CaretLeftIcon, CaretRightIcon, ImagesIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Category } from '../types'
import { AuctionVisual } from './auction-bits'

/** Photo that falls back to the category illustration if it fails to load. */
function SlideImage({
  src,
  alt,
  category,
  eager,
}: {
  src: string
  alt: string
  category: Category
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return <AuctionVisual category={category} className="size-full" />
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className="size-full select-none object-cover"
    />
  )
}

/** Horizontal scroll-snap track: native swipe on touch, arrows/dots drive it on desktop. */
function useTrack(count: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const go = (i: number) => {
    const el = ref.current
    if (!el) return
    const next = (i + count) % count
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
  }
  const onScroll = () => {
    const el = ref.current
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }
  return { ref, index, go, onScroll }
}

const stop = (e: React.SyntheticEvent) => {
  // Cards are links; slider controls must not open the auction.
  e.preventDefault()
  e.stopPropagation()
}

const arrowClass =
  'absolute top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border-2 border-ink bg-white text-ink opacity-0 shadow-[2px_2px_0_#0a0f0d] transition group-hover/media:opacity-100 [@media(hover:none)]:hidden'

/** Shopee-style image slider used inside auction cards. */
export function CardCarousel({
  images,
  category,
  alt,
  className = '',
}: {
  images?: string[]
  category: Category
  alt: string
  className?: string
}) {
  const { t } = useTranslation()
  const list = images ?? []
  const { ref, index, go, onScroll } = useTrack(list.length)
  if (list.length === 0) return <AuctionVisual category={category} className={className} />

  return (
    <div className={`group/media relative overflow-hidden bg-surface-secondary ${className}`}>
      <div
        ref={ref}
        onScroll={onScroll}
        data-lenis-prevent
        className="no-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {list.map((src, i) => (
          <div key={src + i} className="size-full shrink-0 snap-center">
            <SlideImage src={src} alt={`${alt} ${i + 1}`} category={category} eager={i === 0} />
          </div>
        ))}
      </div>

      {list.length > 1 && (
        <>
          <button
            type="button"
            aria-label={t('common.prevPhoto')}
            onClick={(e) => {
              stop(e)
              go(index - 1)
            }}
            className={`${arrowClass} left-2`}
          >
            <CaretLeftIcon weight="bold" />
          </button>
          <button
            type="button"
            aria-label={t('common.nextPhoto')}
            onClick={(e) => {
              stop(e)
              go(index + 1)
            }}
            className={`${arrowClass} right-2`}
          >
            <CaretRightIcon weight="bold" />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
            {list.map((src, i) => (
              <span
                key={src + i}
                className={`h-1.5 rounded-full bg-white shadow-[0_0_0_1px_rgb(10_15_13/0.4)] transition-all ${
                  i === index ? 'w-4' : 'w-1.5 opacity-60'
                }`}
              />
            ))}
          </div>
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
            <ImagesIcon weight="bold" /> {index + 1}/{list.length}
          </span>
        </>
      )}
    </div>
  )
}

/** Detail-page gallery: large swipeable photo plus a thumbnail strip. */
export function Gallery({
  images,
  category,
  alt,
}: {
  images?: string[]
  category: Category
  alt: string
}) {
  const { t } = useTranslation()
  const list = images ?? []
  const { ref, index, go, onScroll } = useTrack(list.length)

  if (list.length === 0) {
    return (
      <AuctionVisual
        category={category}
        className="aspect-[4/3] rounded-3xl border-2 border-ink shadow-[6px_6px_0_var(--card-shadow)]"
      />
    )
  }

  return (
    <div className="space-y-3">
      <div
        className="group/media relative aspect-[4/3] overflow-hidden rounded-3xl border-2 border-ink bg-surface-secondary shadow-[6px_6px_0_var(--card-shadow)]"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') go(index - 1)
          if (e.key === 'ArrowRight') go(index + 1)
        }}
      >
        <div
          ref={ref}
          onScroll={onScroll}
          data-lenis-prevent
          className="no-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {list.map((src, i) => (
            <div key={src + i} className="size-full shrink-0 snap-center">
              <SlideImage src={src} alt={`${alt} ${i + 1}`} category={category} eager={i === 0} />
            </div>
          ))}
        </div>
        {list.length > 1 && (
          <>
            <button
              type="button"
              aria-label={t('common.prevPhoto')}
              onClick={() => go(index - 1)}
              className={`${arrowClass} left-4 size-11`}
            >
              <CaretLeftIcon weight="bold" />
            </button>
            <button
              type="button"
              aria-label={t('common.nextPhoto')}
              onClick={() => go(index + 1)}
              className={`${arrowClass} right-4 size-11`}
            >
              <CaretRightIcon weight="bold" />
            </button>
            <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-extrabold text-ink shadow-[2px_2px_0_#0a0f0d]">
              <ImagesIcon weight="bold" /> {index + 1} / {list.length}
            </span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto p-1" data-lenis-prevent>
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={`aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 transition sm:w-24 ${
                i === index
                  ? 'border-ink shadow-[3px_3px_0_#0a0f0d] ring-2 ring-lime ring-offset-2 ring-offset-background'
                  : 'border-border opacity-70 hover:opacity-100'
              }`}
            >
              <SlideImage src={src} alt="" category={category} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Single cover photo (first image) with the illustrated fallback. */
export function AuctionThumb({
  images,
  category,
  alt,
  className = '',
}: {
  images?: string[]
  category: Category
  alt: string
  className?: string
}) {
  if (!images?.length) return <AuctionVisual category={category} className={className} />
  return (
    <div className={`overflow-hidden bg-surface-secondary ${className}`}>
      <SlideImage src={images[0]} alt={alt} category={category} />
    </div>
  )
}
