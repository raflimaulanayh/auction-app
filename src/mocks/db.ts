import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createSeed, type DemoDb } from './seed'

interface DbStore extends DemoDb {
  reset: () => void
}

/** In-browser "database" that stands in for the Laravel API during the prototype. */
export const useDb = create<DbStore>()(
  persist(
    (set) => ({
      ...createSeed(),
      reset: () => set(createSeed()),
    }),
    { name: 'lelangin-db-v1' },
  ),
)
