import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from '@heroui/react'
import { formatRupiah } from '../lib/money'
import type { NewAuctionInput } from '../types'
import * as api from './auctionService'
import { AuctionError, type AuctionFilters } from './auctionService'
import { useSession } from './authService'

export const keys = {
  all: ['auctions'] as const,
  list: (f: AuctionFilters) => ['auctions', 'list', f] as const,
  detail: (id: string, userId?: string) => ['auctions', 'detail', id, userId] as const,
  myBids: (userId: string) => ['auctions', 'my-bids', userId] as const,
  watchlist: (userId: string) => ['auctions', 'watchlist', userId] as const,
  seller: (userId: string) => ['auctions', 'seller', userId] as const,
}

export const useAuctions = (filters: AuctionFilters) =>
  useQuery({ queryKey: keys.list(filters), queryFn: () => api.listAuctions(filters) })

export function useAuction(id: string) {
  const userId = useSession((s) => s.user?.id)
  return useQuery({
    queryKey: keys.detail(id, userId),
    queryFn: () => api.getAuction(id, userId),
    // A missing auction won't appear on retry; show the 404 right away.
    retry: (count, error) =>
      !(error instanceof AuctionError && error.code === 'notFound') && count < 2,
  })
}

export function useMyBids() {
  const userId = useSession((s) => s.user?.id) ?? ''
  return useQuery({ queryKey: keys.myBids(userId), queryFn: () => api.listMyBids(userId) })
}

export function useWatchlist() {
  const userId = useSession((s) => s.user?.id) ?? ''
  return useQuery({ queryKey: keys.watchlist(userId), queryFn: () => api.listWatchlist(userId) })
}

export function useSellerAuctions() {
  const userId = useSession((s) => s.user?.id) ?? ''
  return useQuery({ queryKey: keys.seller(userId), queryFn: () => api.listSellerAuctions(userId) })
}

/** Translates service error codes, the same way FE will handle Laravel `code` errors. */
export function useErrorToast() {
  const { t } = useTranslation()
  return (error: unknown) => {
    if (error instanceof AuctionError) {
      const min = error.params.min as number | undefined
      const message =
        error.code === 'bidTooLow'
          ? t('errors.bidTooLow', { min: formatRupiah(min ?? 0) })
          : t(`errors.${error.code as 'notLive' | 'ownAuction' | 'notFound'}`)
      toast.danger(message)
    } else {
      toast.danger(t('errors.generic'))
    }
  }
}

function useAuctionMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient()
  const onError = useErrorToast()
  return useMutation({
    mutationFn: fn,
    onError,
    onSettled: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

const requireUser = () => {
  const user = useSession.getState().user
  if (!user) throw new AuctionError('notLive')
  return user
}

export const usePlaceBid = (id: string) =>
  useAuctionMutation((amount: number) => api.placeBid(id, requireUser(), amount))

export const useSetProxy = (id: string) =>
  useAuctionMutation((max: number) => api.setProxyBid(id, requireUser(), max))

export const useBuyNow = (id: string) => useAuctionMutation(() => api.buyNow(id, requireUser()))

export const useSubmitSealed = (id: string) =>
  useAuctionMutation((amount: number) => api.submitSealedBid(id, requireUser(), amount))

export const useToggleWatch = (id: string) =>
  useAuctionMutation(() => api.toggleWatch(id, requireUser()))

export const useCreateAuction = () =>
  useAuctionMutation((input: NewAuctionInput) => api.createAuction(input, requireUser()))
