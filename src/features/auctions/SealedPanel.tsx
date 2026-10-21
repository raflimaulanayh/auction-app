import { Button, Chip, toast } from '@heroui/react'
import { CrownIcon, EnvelopeSimpleIcon, LockKeyIcon, SealCheckIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatRupiah } from '../../lib/money'
import type { AuctionDetail } from '../../services/auctionService'
import { useSubmitSealed } from '../../services/queries'
import type { User } from '../../types'
import { MoneyInput } from './MoneyInput'

export function SealedPanel({
  detail,
  user,
  live,
}: {
  detail: AuctionDetail
  user?: User
  live: boolean
}) {
  const { t } = useTranslation()
  const { auction, myBid, sealedResult } = detail
  const [amount, setAmount] = useState(myBid?.amount ?? auction.startingPrice)
  const submit = useSubmitSealed(auction.id)

  if (sealedResult) {
    const youWon = sealedResult.winnerId === user?.id
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <EnvelopeSimpleIcon weight="duotone" className="size-5 text-accent" />
          <p className="font-semibold">{t('sealed.reveal')}</p>
        </div>
        {sealedResult.winnerId && (
          <div
            className={`rounded-2xl p-4 ${youWon ? 'bg-success-soft text-success-soft-foreground' : 'bg-surface-secondary'}`}
          >
            {youWon && <p className="mb-2 font-bold">🎉 {t('sealed.youWon')}</p>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs opacity-70">{t('sealed.winner')}</p>
                <p className="flex items-center gap-1 font-semibold">
                  <CrownIcon weight="fill" className="text-amber-500" />
                  {sealedResult.winnerName}
                </p>
              </div>
              <div>
                <p className="text-xs opacity-70">{t('sealed.pays')}</p>
                <p className="tabular font-bold">{formatRupiah(sealedResult.pricePaid ?? 0)}</p>
              </div>
            </div>
          </div>
        )}
        <ol className="space-y-2">
          {sealedResult.ranking.map((b, i) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-surface-secondary text-xs font-bold">
                  {i + 1}
                </span>
                {b.userId === user?.id ? t('common.you') : b.userName}
              </span>
              <span className={`tabular font-semibold ${i === 1 ? 'text-accent' : ''}`}>
                {formatRupiah(b.amount)}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted">{t('sealed.vickreyInfo')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl bg-surface-secondary p-3 text-sm">
        <LockKeyIcon weight="duotone" className="mt-0.5 size-5 shrink-0 text-accent" />
        <p className="text-muted">{t('sealed.hiddenInfo')}</p>
      </div>
      {myBid && (
        <Chip color="success" variant="soft">
          <SealCheckIcon weight="bold" />
          <Chip.Label>
            {t('sealed.yourSealed')}: {formatRupiah(myBid.amount)}
          </Chip.Label>
        </Chip>
      )}
      {live && user && (
        <>
          <MoneyInput
            id="sealed"
            label={t('sealed.yourSealed')}
            value={amount}
            onChange={setAmount}
          />
          <Button
            fullWidth
            size="lg"
            isPending={submit.isPending}
            isDisabled={amount < auction.startingPrice}
            onPress={() =>
              submit.mutate(amount, { onSuccess: () => toast.success(t('sealed.submitted')) })
            }
          >
            <EnvelopeSimpleIcon weight="fill" />
            {myBid ? t('sealed.update') : t('sealed.submit')}
          </Button>
        </>
      )}
      <p className="text-xs text-muted">{t('sealed.vickreyInfo')}</p>
    </div>
  )
}
