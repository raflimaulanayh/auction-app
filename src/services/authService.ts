import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_USERS } from '../mocks/seed'
import type { User } from '../types'

interface SessionStore {
  user: User | null
  setUser: (user: User | null) => void
}

export const useSession = create<SessionStore>()(
  persist((set) => ({ user: null, setUser: (user) => set({ user }) }), {
    name: 'lelangin-session',
  }),
)

/** Dummy login: any password is accepted. Replace with Laravel Sanctum later. */
export async function login(email: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 500))
  const known = DEMO_USERS.find((u) => u.email === email.toLowerCase())
  const name = email.split('@')[0].replace(/[._-]+/g, ' ')
  const user = known ?? {
    id: `u-${email.toLowerCase()}`,
    name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    role: 'buyer' as const,
  }
  useSession.getState().setUser(user)
  return user
}

export function logout() {
  useSession.getState().setUser(null)
}
