import { enUS, id } from 'date-fns/locale'
import { useSyncExternalStore } from 'react'
import i18n from '../i18n'

// One shared 1s ticker for every countdown on the page.
let now = Date.now()
const subscribers = new Set<() => void>()
setInterval(() => {
  now = Date.now()
  subscribers.forEach((s) => s())
}, 1000)

export function useNow(): number {
  return useSyncExternalStore(
    (cb) => {
      subscribers.add(cb)
      return () => subscribers.delete(cb)
    },
    () => now,
  )
}

export function dateLocale() {
  return i18n.language?.startsWith('en') ? enUS : id
}

export function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}
