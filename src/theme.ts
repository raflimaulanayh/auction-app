import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  dark: boolean
  toggle: () => void
}

const apply = (dark: boolean) => {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggle: () => {
        apply(!get().dark)
        set({ dark: !get().dark })
      },
    }),
    { name: 'lelangin-theme', onRehydrateStorage: () => (s) => apply(s?.dark ?? false) },
  ),
)
apply(useTheme.getState().dark)
