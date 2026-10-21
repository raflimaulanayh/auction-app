import { useEffect, useRef } from 'react'
import type { Bid } from '../types'

/**
 * Stand-in for Laravel Reverb. Event names mirror the planned broadcast events so the
 * hook below can later be backed by `useEcho` from `@laravel/echo-react`.
 */
export type RealtimeEvent =
  | { type: 'BidPlaced'; auctionId: string; bid: Bid }
  | { type: 'AuctionExtended'; auctionId: string; endsAt: number }
  | { type: 'Outbid'; auctionId: string; userId: string; amount: number; title: string }
  | { type: 'AuctionSold'; auctionId: string; userId: string }

type Listener = (event: RealtimeEvent) => void
const listeners = new Set<Listener>()

export const realtime = {
  emit(event: RealtimeEvent) {
    listeners.forEach((l) => l(event))
  },
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

export function useRealtime(listener: Listener) {
  const ref = useRef(listener)
  useEffect(() => {
    ref.current = listener
  })
  useEffect(() => realtime.subscribe((e) => ref.current(e)), [])
}
