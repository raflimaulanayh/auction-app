import { useRouterState } from '@tanstack/react-router'
import { ReactLenis, useLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
import { useEffect } from 'react'

function ScrollToTopOnNavigate() {
  const lenis = useLenis()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [pathname, lenis])
  return null
}

/** Lenis smooth scrolling for the whole page; plain native scroll for reduced-motion users. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()
  if (reduced) return <>{children}</>
  return (
    <ReactLenis root options={{ lerp: 0.09, wheelMultiplier: 1 }}>
      <ScrollToTopOnNavigate />
      {children}
    </ReactLenis>
  )
}
