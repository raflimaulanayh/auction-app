import { useSpring } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { formatRupiah } from '../../lib/money'

/**
 * Rupiah amount that rolls to its new value on a spring. Writes straight to the DOM
 * so a ticking price doesn't re-render React every frame.
 */
export function AnimatedPrice({
  value,
  from,
  className,
}: {
  value: number
  /** Start value on mount; defaults to `value` (no initial roll). */
  from?: number
  className?: string
}) {
  const { i18n } = useTranslation()
  const ref = useRef<HTMLSpanElement>(null)
  const spring = useSpring(from ?? value, { stiffness: 90, damping: 18, mass: 0.8 })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const render = (v: number) => {
      if (ref.current) ref.current.textContent = formatRupiah(Math.round(v))
    }
    render(spring.get())
    return spring.on('change', render)
  }, [spring, i18n.language])

  return <span ref={ref} className={`tabular ${className ?? ''}`} />
}
