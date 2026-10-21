import { auctionStatus, bidIncrement, minNextBid } from '../lib/auction-rules'
import { placeBidNow } from '../services/auctionService'
import { useDb } from './db'
import { BOTS } from './seed'

/**
 * Bot bidders that keep English auctions moving during the demo, so the realtime
 * updates, outbid toasts and anti-sniping extensions are visible without a backend.
 */
export function startSimulator() {
  let timer: ReturnType<typeof setTimeout>

  const tick = () => {
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
