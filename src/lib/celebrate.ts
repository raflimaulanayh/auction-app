import confetti from 'canvas-confetti'

const COLORS = ['#f5c451', '#ffffff', '#6366f1', '#ec4899', '#22c55e']

/** Confetti burst for winning moments (leading bid, purchase, auction won). */
export function celebrate() {
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 9999, ticks: 220 }
  void confetti({
    ...base,
    particleCount: 90,
    spread: 75,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.65 },
  })
  setTimeout(() => {
    void confetti({ ...base, particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } })
    void confetti({ ...base, particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } })
  }, 180)
}
