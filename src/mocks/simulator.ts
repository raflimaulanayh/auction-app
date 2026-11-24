import { auctionStatus, bidIncrement, minNextBid } from '../lib/auction-rules'
import { placeBidNow, submitSealedBid } from '../services/auctionService'
import type { User } from '../types'
import { useDb } from './db'
import { BOTS } from './seed'

/**
 * Bot bidders that keep English auctions moving during the demo, so the realtime
 * updates, outbid toasts and anti-sniping extensions are visible without a backend.
 */
export function startSimulator() {
  let timer: ReturnType<typeof setTimeout>

  /** Occasionally a bot joins an open sealed-bid auction (once per bot per auction). */
  const sealedTick = () => {
    const { auctions, bids } = useDb.getState()
    const now = Date.now()
    const open = auctions.filter((a) => a.type === 'sealed' && auctionStatus(a, now) === 'live')
    const auction = open[Math.floor(Math.random() * open.length)]
    if (!auction) return
    const joined = new Set(bids.filter((b) => b.auctionId === auction.id).map((b) => b.userId))
    const bot = BOTS.find((b) => !joined.has(b.id))
    if (!bot) return
    const amount =
      Math.round((auction.startingPrice * (1.05 + Math.random() * 0.3)) / 50_000) * 50_000
    void submitSealedBid(auction.id, { ...bot, email: '', role: 'buyer' } as User, amount).catch(
      () => {},
    )
  }

  const tick = () => {
    if (Math.random() < 0.2) sealedTick()
    const { auctions, bids } = useDb.getState()
    const now = Date.now()
    const live = auctions.filter((a) => a.type === 'english' && auctionStatus(a, now) === 'live')
    const auction = live[Math.floor(Math.random() * live.length)]
    if (auction) {
      const auctionBids = bids.filter((b) => b.auctionId === auction.id).sort((a, b) => b.at - a.at)
      const leaderId = auctionBids[0]?.userId
      // Bots stop at a cap so a real user can still win.
      const cap = Math.max(auction.reservePrice ?? 0, auction.startingPrice) * 1.08
      const amount =
        minNextBid(auction, auctionBids.length) +
        (Math.random() < 0.3 ? bidIncrement(auction.currentPrice) : 0)
      const candidates = BOTS.filter((b) => b.id !== leaderId)
      const bot = candidates[Math.floor(Math.random() * candidates.length)]
      if (amount <= cap) {
        try {
          placeBidNow(auction.id, bot, amount)
        } catch {
          // Auction may have closed between the check and the bid.
        }
      }
    }
    timer = setTimeout(tick, 7000 + Math.random() * 6000)
  }

  timer = setTimeout(tick, 6000)
  return () => clearTimeout(timer)
}
