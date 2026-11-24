import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createSeed, type DemoDb } from './seed'

interface DbStore extends DemoDb {
  reset: () => void
}

/** Closing the tab for longer than this pauses the demo clock instead of letting it run. */
const IDLE_MS = 2 * 60_000

/**
 * Moves every timestamp forward by `delta`, so the demo resumes exactly where it was
 * left instead of every auction having expired while nobody had the app open.
 */
function shiftTime(db: DemoDb, delta: number): DemoDb {
  const at = (t: number | undefined) => (t === undefined ? t : t + delta)
  return {
    ...db,
    clock: db.clock + delta,
    auctions: db.auctions.map((a) => ({
      ...a,
      startsAt: a.startsAt + delta,
      endsAt: a.endsAt + delta,
      createdAt: a.createdAt + delta,
      soldAt: at(a.soldAt),
    })),
    bids: db.bids.map((b) => ({ ...b, at: b.at + delta })),
  }
}

/** In-browser "database" that stands in for the Laravel API during the prototype. */
export const useDb = create<DbStore>()(
  persist(
    (set) => ({
      ...createSeed(),
      reset: () => set(createSeed()),
    }),
    {
      name: 'lelangin-db-v2',
      // v0 data has no clock and its auctions have long expired: start fresh.
      version: 1,
      migrate: () => createSeed() as unknown as DbStore,
      merge: (persisted, current) => {
        const saved = persisted as DemoDb | undefined
        if (!saved?.clock) return current
        const idle = Date.now() - saved.clock
        return { ...current, ...(idle > IDLE_MS ? shiftTime(saved, idle) : saved) }
      },
    },
  ),
)

// Heartbeat: remember when the app was last open.
const touch = () => useDb.setState({ clock: Date.now() })
setInterval(touch, 30_000)
document.addEventListener('visibilitychange', touch)
window.addEventListener('pagehide', touch)
