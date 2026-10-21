export type AuctionType = 'english' | 'dutch' | 'sealed'
export type AuctionStatus = 'upcoming' | 'live' | 'ended'
export type Category = 'electronics' | 'watches' | 'art' | 'vehicles' | 'collectibles' | 'fashion'
export type Role = 'buyer' | 'seller'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Auction {
  id: string
  title: string
  description: string
  category: Category
  sellerId: string
  sellerName: string
  type: AuctionType
  startsAt: number
  endsAt: number
  startingPrice: number
  /** English: highest bid. Dutch: price paid once sold. Sealed: hidden until the end. */
  currentPrice: number
  reservePrice?: number
  buyNowPrice?: number
  /** Dutch only */
  floorPrice?: number
  decrement?: number
  intervalSec?: number
  extendedCount: number
  /** Photo URLs; the first one is the cover. */
  images?: string[]
  soldAt?: number
  winnerId?: string
  createdAt: number
}

export interface Bid {
  id: string
  auctionId: string
  userId: string
  userName: string
  amount: number
  at: number
  isProxy?: boolean
}

export interface ProxyBid {
  auctionId: string
  userId: string
  userName: string
  max: number
}

export interface SealedResult {
  winnerId?: string
  winnerName?: string
  pricePaid?: number
  ranking: Bid[]
}

export type NewAuctionInput = Pick<
  Auction,
  | 'title'
  | 'description'
  | 'category'
  | 'type'
  | 'startingPrice'
  | 'reservePrice'
  | 'buyNowPrice'
  | 'floorPrice'
  | 'decrement'
  | 'intervalSec'
  | 'images'
> & { durationMin: number }
