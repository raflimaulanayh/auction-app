/**
 * Data access for auctions. Backed by the in-browser demo db for the prototype;
 * swap these implementations for calls to the Laravel API when it is ready.
 */
import {
  applyAntiSniping,
  auctionStatus,
  dutchPrice,
  minNextBid,
  resolveProxies,
  resolveSealed,
} from '../lib/auction-rules'
import { realtime } from '../lib/realtime'
import { useDb } from '../mocks/db'
import type {
  Auction,
  AuctionStatus,
  AuctionType,
  Bid,
  Category,
  NewAuctionInput,
  SealedResult,
  User,
} from '../types'

export class AuctionError extends Error {
  code: string
  params: Record<string, unknown>
  constructor(code: string, params: Record<string, unknown> = {}) {
    super(code)
    this.code = code
    this.params = params
  }
}

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))
const uid = () => Math.random().toString(36).slice(2, 10)

export interface AuctionFilters {
  q?: string
  type?: AuctionType
  status?: AuctionStatus
  category?: Category
  sort?: 'ending' | 'newest' | 'price-asc' | 'price-desc'
}

export interface AuctionSummary extends Auction {
  bidCount: number
  displayPrice: number
}

function summarize(a: Auction, bids: Bid[], now: number): AuctionSummary {
  const bidCount = bids.filter((b) => b.auctionId === a.id).length
  const displayPrice = a.type === 'dutch' ? dutchPrice(a, now) : a.currentPrice
  return { ...a, bidCount, displayPrice }
}

export async function listAuctions(filters: AuctionFilters = {}): Promise<AuctionSummary[]> {
  await delay(250)
  const { auctions, bids } = useDb.getState()
  const now = Date.now()
  const q = filters.q?.trim().toLowerCase()
  const list = auctions
    .filter((a) => !q || a.title.toLowerCase().includes(q))
    .filter((a) => !filters.type || a.type === filters.type)
    .filter((a) => !filters.category || a.category === filters.category)
    .filter((a) => !filters.status || auctionStatus(a, now) === filters.status)
    .map((a) => summarize(a, bids, now))

  const rank = { live: 0, upcoming: 1, ended: 2 }
  switch (filters.sort ?? 'ending') {
    case 'newest':
      return list.sort((a, b) => b.createdAt - a.createdAt)
    case 'price-asc':
      return list.sort((a, b) => a.displayPrice - b.displayPrice)
    case 'price-desc':
      return list.sort((a, b) => b.displayPrice - a.displayPrice)
    default:
      return list.sort(
        (a, b) =>
          rank[auctionStatus(a, now)] - rank[auctionStatus(b, now)] ||
          (auctionStatus(a, now) === 'ended' ? b.endsAt - a.endsAt : a.endsAt - b.endsAt),
      )
  }
}

export interface AuctionDetail {
  auction: Auction
  /** Public bid history; empty for sealed auctions that are still open. */
  bids: Bid[]
  bidCount: number
  participantCount: number
  myBid?: Bid
  myProxyMax?: number
  sealedResult?: SealedResult
  watched: boolean
}

export async function getAuction(id: string, userId?: string): Promise<AuctionDetail> {
  await delay(200)
  const { auctions, bids, proxies, watchlist } = useDb.getState()
  const auction = auctions.find((a) => a.id === id)
  if (!auction) throw new AuctionError('notFound')
  const auctionBids = bids.filter((b) => b.auctionId === id).sort((a, b) => b.at - a.at)
  const ended = auctionStatus(auction, Date.now()) === 'ended'
  const isSealed = auction.type === 'sealed'
  const mine = auctionBids.filter((b) => b.userId === userId)

  return {
    auction,
    bids: isSealed && !ended ? [] : auctionBids,
    bidCount: auctionBids.length,
    participantCount: new Set(auctionBids.map((b) => b.userId)).size,
    myBid: mine[0],
    myProxyMax: proxies.find((p) => p.auctionId === id && p.userId === userId)?.max,
    sealedResult: isSealed && ended ? resolveSealed(auction, auctionBids) : undefined,
    watched: !!userId && (watchlist[userId] ?? []).includes(id),
  }
}

function requireLive(auction: Auction | undefined, user: User): Auction {
  if (!auction) throw new AuctionError('notFound')
  if (auction.sellerId === user.id) throw new AuctionError('ownAuction')
  if (auctionStatus(auction, Date.now()) !== 'live') throw new AuctionError('notLive')
  return auction
}

/** English bid. Also used by the simulator bots, hence no artificial delay here. */
export function placeBidNow(auctionId: string, user: Pick<User, 'id' | 'name'>, amount: number) {
  const db = useDb.getState()
  const now = Date.now()
  const auction = requireLive(
    db.auctions.find((a) => a.id === auctionId),
    user as User,
  )
  const count = db.bids.filter((b) => b.auctionId === auctionId).length
  const min = minNextBid(auction, count)
  if (amount < min) throw new AuctionError('bidTooLow', { min })
  const previousLeader = db.bids
    .filter((b) => b.auctionId === auctionId)
    .sort((a, b) => b.at - a.at)[0]

  const bid: Bid = { id: uid(), auctionId, userId: user.id, userName: user.name, amount, at: now }
  const proxies = db.proxies.filter((p) => p.auctionId === auctionId)
  const resolved = resolveProxies(
    { ...auction, currentPrice: amount },
    { id: user.id, name: user.name },
    proxies,
    now + 1,
  )
  const autoBids: Bid[] = resolved.autoBids.map((b) => ({ ...b, id: uid() }))
  const updated = applyAntiSniping({ ...auction, currentPrice: resolved.price }, now)

  useDb.setState({
    auctions: db.auctions.map((a) => (a.id === auctionId ? updated : a)),
    bids: [...db.bids, bid, ...autoBids],
  })

  realtime.emit({ type: 'BidPlaced', auctionId, bid: autoBids.at(-1) ?? bid })
  if (updated.endsAt !== auction.endsAt) {
    realtime.emit({ type: 'AuctionExtended', auctionId, endsAt: updated.endsAt })
  }
  // Notify whoever just lost the lead.
  const losers = new Set([previousLeader?.userId, user.id])
  losers.delete(resolved.leader.id)
  losers.forEach((loser) => {
    if (loser) {
      realtime.emit({
        type: 'Outbid',
        auctionId,
        userId: loser,
        amount: resolved.price,
        title: auction.title,
      })
    }
  })
  return { leaderId: resolved.leader.id, price: resolved.price }
}

export async function placeBid(auctionId: string, user: User, amount: number) {
  await delay()
  return placeBidNow(auctionId, user, amount)
}

export async function setProxyBid(auctionId: string, user: User, max: number) {
  await delay()
  const db = useDb.getState()
  const auction = requireLive(
    db.auctions.find((a) => a.id === auctionId),
    user,
  )
  const count = db.bids.filter((b) => b.auctionId === auctionId).length
  const min = minNextBid(auction, count)
  if (max < min) throw new AuctionError('bidTooLow', { min })
  useDb.setState({
    proxies: [
      ...db.proxies.filter((p) => !(p.auctionId === auctionId && p.userId === user.id)),
      { auctionId, userId: user.id, userName: user.name, max },
    ],
  })
  // Enter the auction at the minimum; the proxy engine carries it from there.
  const leader = db.bids.filter((b) => b.auctionId === auctionId).sort((a, b) => b.at - a.at)[0]
  if (leader?.userId === user.id) return { leaderId: user.id, price: auction.currentPrice }
  return placeBidNow(auctionId, user, min)
}

/** Dutch "buy at current price" and English buy-now. */
export async function buyNow(auctionId: string, user: User) {
  await delay()
  const db = useDb.getState()
  const now = Date.now()
  const auction = requireLive(
    db.auctions.find((a) => a.id === auctionId),
    user,
  )
  const price = auction.type === 'dutch' ? dutchPrice(auction, now) : auction.buyNowPrice
  if (!price) throw new AuctionError('notLive')
  const bid: Bid = {
    id: uid(),
    auctionId,
    userId: user.id,
    userName: user.name,
    amount: price,
    at: now,
  }
  useDb.setState({
    auctions: db.auctions.map((a) =>
      a.id === auctionId ? { ...a, currentPrice: price, soldAt: now, winnerId: user.id } : a,
    ),
    bids: [...db.bids, bid],
  })
  realtime.emit({ type: 'AuctionSold', auctionId, userId: user.id })
  return { price }
}

export async function submitSealedBid(auctionId: string, user: User, amount: number) {
  await delay()
  const db = useDb.getState()
  const auction = requireLive(
    db.auctions.find((a) => a.id === auctionId),
    user,
  )
  if (amount < auction.startingPrice)
    throw new AuctionError('bidTooLow', { min: auction.startingPrice })
  const bid: Bid = {
    id: uid(),
    auctionId,
    userId: user.id,
    userName: user.name,
    amount,
    at: Date.now(),
  }
  // One sealed bid per user; resubmitting replaces it.
  useDb.setState({
    bids: [...db.bids.filter((b) => !(b.auctionId === auctionId && b.userId === user.id)), bid],
  })
  return bid
}

export async function toggleWatch(auctionId: string, user: User) {
  await delay(150)
  const { watchlist } = useDb.getState()
  const list = watchlist[user.id] ?? []
  const next = list.includes(auctionId)
    ? list.filter((id) => id !== auctionId)
    : [...list, auctionId]
  useDb.setState({ watchlist: { ...watchlist, [user.id]: next } })
  return next.includes(auctionId)
}

export async function createAuction(input: NewAuctionInput, user: User) {
  await delay(600)
  const now = Date.now()
  const { durationMin, ...rest } = input
  const auction: Auction = {
    ...rest,
    id: `${input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40)}-${uid().slice(0, 4)}`,
    sellerId: user.id,
    sellerName: user.name,
    startsAt: now,
    endsAt: now + durationMin * 60_000,
    currentPrice: input.startingPrice,
    extendedCount: 0,
    createdAt: now,
  }
  useDb.setState((s) => ({ auctions: [auction, ...s.auctions] }))
  return auction
}

export type MyBidState = 'leading' | 'outbid' | 'won' | 'lost' | 'sealed'

export interface MyBidRow {
  auction: AuctionSummary
  myTop: number
  state: MyBidState
}

export async function listMyBids(userId: string): Promise<MyBidRow[]> {
  await delay(250)
  const { auctions, bids } = useDb.getState()
  const now = Date.now()
  return auctions
    .filter((a) => bids.some((b) => b.auctionId === a.id && b.userId === userId))
    .map((a) => {
      const ab = bids.filter((b) => b.auctionId === a.id)
      const myTop = Math.max(...ab.filter((b) => b.userId === userId).map((b) => b.amount))
      const ended = auctionStatus(a, now) === 'ended'
      let state: MyBidState
      if (a.type === 'sealed') {
        state = ended ? (resolveSealed(a, ab).winnerId === userId ? 'won' : 'lost') : 'sealed'
      } else {
        const leader = [...ab].sort((x, y) => y.at - x.at)[0]?.userId
        const isLeader = (a.winnerId ?? leader) === userId
        state = ended ? (isLeader ? 'won' : 'lost') : isLeader ? 'leading' : 'outbid'
      }
      return { auction: summarize(a, bids, now), myTop, state }
    })
    .sort((x, y) => x.auction.endsAt - y.auction.endsAt)
}

export async function listWatchlist(userId: string): Promise<AuctionSummary[]> {
  await delay(200)
  const { auctions, bids, watchlist } = useDb.getState()
  const ids = watchlist[userId] ?? []
  return auctions.filter((a) => ids.includes(a.id)).map((a) => summarize(a, bids, Date.now()))
}

export async function listSellerAuctions(userId: string): Promise<AuctionSummary[]> {
  await delay(250)
  const { auctions, bids } = useDb.getState()
  return auctions
    .filter((a) => a.sellerId === userId)
    .map((a) => summarize(a, bids, Date.now()))
    .sort((a, b) => b.createdAt - a.createdAt)
}
