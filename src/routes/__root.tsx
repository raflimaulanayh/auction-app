import { Toast } from '@heroui/react'
import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { MotionConfig, motion } from 'motion/react'
import { AppShell } from '../components/AppShell'
import { SmoothScroll } from '../components/motion/SmoothScroll'

function PageTransition() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Outlet />
    </motion.div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <AppShell>
          <Toast.Provider placement="bottom end" />
          <PageTransition />
        </AppShell>
      </SmoothScroll>
    </MotionConfig>
  ),
})
