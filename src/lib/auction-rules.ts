import type { Auction, AuctionStatus, Bid, ProxyBid, SealedResult } from '../types'

/** Bids in the last ANTI_SNIPE_MS extend the auction so nobody wins by sniping. */
export const ANTI_SNIPE_MS = 60_000

/** Tiered minimum increment, like most auction houses. */
export function bidIncrement(price: number): number {
  if (price < 1_000_000) return 50_000
  if (price < 10_000_000) return 100_000
  if (price < 50_000_000) return 500_000
  return 1_000_000
}

export function minNextBid(auction: Auction, bidCount: number): number {
  if (bidCount === 0) return auction.startingPrice
  return auction.currentPrice + bidIncrement(auction.currentPrice)
}

export function auctionStatus(auction: Auction, now: number): AuctionStatus {
  if (auction.soldAt) return 'ended'
  if (now < auction.startsAt) return 'upcoming'
  if (now >= auction.endsAt) return 'ended'
  return 'live'
}

export function dutchPrice(auction: Auction, now: number): number {
  const { startingPrice, floorPrice = 0, decrement = 0, intervalSec = 60 } = auction
  if (auction.soldAt) return auction.currentPrice
  const elapsed = Math.max(0, Math.min(now, auction.endsAt) - auction.startsAt)
  const steps = Math.floor(elapsed / (intervalSec * 1000))
  return Math.max(floorPrice, startingPrice - steps * decrement)
}

/** Milliseconds until the next Dutch price drop. */
export function dutchNextDropIn(auction: Auction, now: number): number {
  const interval = (auction.intervalSec ?? 60) * 1000
  const elapsed = Math.max(0, now - auction.startsAt)
  return interval - (elapsed % interval)
}

/** Extends the end time when a bid lands inside the anti-sniping window. */
export function applyAntiSniping(auction: Auction, now: number): Auction {
  if (auction.endsAt - now >= ANTI_SNIPE_MS) return auction
  return { ...auction, endsAt: now + ANTI_SNIPE_MS, extendedCount: auction.extendedCount + 1 }
}

/**
 * eBay-style proxy resolution: after a bid, any competitor whose max can beat the
 * current price bids again automatically, one increment at a time, until only one
 * proxy is left able to bid.
 */
export function resolveProxies(
  auction: Auction,
  leader: { id: string; name: string },
  proxies: ProxyBid[],
  now: number,
): { price: number; leader: { id: string; name: string }; autoBids: Omit<Bid, 'id'>[] } {
  let price = auction.currentPrice
  let current = leader
  const autoBids: Omit<Bid, 'id'>[] = []

  for (let i = 0; i < 100; i++) {
    const next = price + bidIncrement(price)
    const challenger = proxies
      .filter((p) => p.userId !== current.id && p.max >= next)
      .sort((a, b) => b.max - a.max)[0]
    if (!challenger) break
    const leaderProxy = proxies.find((p) => p.userId === current.id)
    // The challenger only needs to beat what the leader can still defend.
    const defend = leaderProxy ? Math.max(price, leaderProxy.max) : price
    const amount = Math.min(challenger.max, defend + bidIncrement(defend))
    if (amount <= price) break
    price = amount
    current = { id: challenger.userId, name: challenger.userName }
    autoBids.push({
      auctionId: auction.id,
      userId: challenger.userId,
      userName: challenger.userName,
      amount,
      at: now + i,
      isProxy: true,
    })
  }

  return { price, leader: current, autoBids }
}

/** Vickrey: the highest sealed bid wins but pays the second-highest bid (or the start price). */
export function resolveSealed(auction: Auction, bids: Bid[]): SealedResult {
  const ranking = [...bids].sort((a, b) => b.amount - a.amount || a.at - b.at)
  const [first, second] = ranking
  if (!first || (auction.reservePrice && first.amount < auction.reservePrice)) {
    return { ranking }
  }
  return {
    ranking,
    winnerId: first.userId,
    winnerName: first.userName,
    pricePaid: second ? second.amount : auction.startingPrice,
  }
}

export function reserveMet(auction: Auction, bidCount: number): boolean {
  if (!auction.reservePrice) return true
  return bidCount > 0 && auction.currentPrice >= auction.reservePrice
}
