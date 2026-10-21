import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'

const SPRING = { stiffness: 220, damping: 18, mass: 0.5 }

/** Subtle 3D tilt toward the cursor with a moving glare highlight. */
export function TiltCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  const rx = useSpring(0, SPRING)
  const ry = useSpring(0, SPRING)
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glareOpacity = useSpring(0, SPRING)
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.22), transparent 45%)`

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={`relative [perspective:900px] ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry.set((px - 0.5) * 10)
        rx.set((0.5 - py) * 10)
        gx.set(px * 100)
        gy.set(py * 100)
        glareOpacity.set(1)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
        glareOpacity.set(0)
      }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="relative h-full"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: glare, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
        />
      </motion.div>
    </motion.div>
  )
}
