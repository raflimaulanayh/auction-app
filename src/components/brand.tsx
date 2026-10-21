import { motion } from 'motion/react'

/** Lime highlighter block behind key words; draws in from the left when scrolled into view. */
export function Marker({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`relative inline-block px-[0.18em] ${className}`}>
      <motion.span
        aria-hidden
        className="absolute inset-x-0 inset-y-[0.06em] -rotate-[1.5deg] rounded-md bg-lime shadow-[3px_3px_0_rgb(10_15_13/0.55)]"
        style={{ originX: 0 }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
      />
      <span className="relative text-ink">{children}</span>
    </span>
  )
}

/** Handwritten annotation (Caveat), slightly tilted, used as an eyebrow above headings. */
export function ScriptNote({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.p
      className={`script inline-block -rotate-1 text-2xl leading-none sm:text-[1.7rem] ${className}`}
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.p>
  )
}

/** Big tight display heading used for page and section titles. */
export function Display({
  as: Tag = 'h2',
  children,
  className = '',
}: {
  as?: 'h1' | 'h2'
  children: React.ReactNode
  className?: string
}) {
  return (
    <Tag
      className={`text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-5xl ${className}`}
    >
      {children}
    </Tag>
  )
}
