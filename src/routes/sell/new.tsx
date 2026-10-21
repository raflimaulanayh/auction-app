import { Button, Card, Input, Label, TextArea, TextField, toast } from '@heroui/react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, RocketLaunchIcon } from '@phosphor-icons/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TYPE_ICON, TypeChip } from '../../components/auction-bits'
import { CardCarousel } from '../../components/media'
import { PhotoPicker } from '../../features/seller/PhotoPicker'
import { EmptyState } from '../../components/AuctionCard'
import { MoneyInput } from '../../features/auctions/MoneyInput'
import { requireAuth } from '../../lib/guard'
import { formatRupiah } from '../../lib/money'
import { useSession } from '../../services/authService'
import { useCreateAuction } from '../../services/queries'
import type { AuctionType, Category, NewAuctionInput } from '../../types'

export const Route = createFileRoute('/sell/new')({
  beforeLoad: requireAuth,
  component: CreateAuctionPage,
})

const CATEGORIES: Category[] = [
  'electronics',
  'watches',
  'art',
  'vehicles',
  'collectibles',
  'fashion',
]

function CreateAuctionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSession((s) => s.user)
  const create = useCreateAuction()
  const [step, setStep] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [form, setForm] = useState<NewAuctionInput>({
    type: 'english',
    title: '',
    description: '',
    category: 'electronics',
    startingPrice: 1_000_000,
    durationMin: 5,
    floorPrice: 500_000,
    decrement: 50_000,
    intervalSec: 15,
    images: [],
  })
  const patch = (p: Partial<NewAuctionInput>) => setForm((f) => ({ ...f, ...p }))

  if (user?.role !== 'seller') return <EmptyState message={t('seller.onlySeller')} />

  const steps = [
    t('seller.stepType'),
    t('seller.stepItem'),
    t('seller.stepRules'),
    t('seller.stepReview'),
  ]
  const itemValid = form.title.trim().length > 2 && form.description.trim().length > 0
  const rulesValid =
    form.startingPrice > 0 &&
    form.durationMin > 0 &&
    (form.type !== 'dutch' || (form.floorPrice ?? 0) < form.startingPrice)
  const canNext = step === 1 ? itemValid : step === 2 ? rulesValid : true

  const next = () => {
    if (!canNext) return setShowErrors(true)
    setShowErrors(false)
    setStep((s) => s + 1)
  }

  const publish = () =>
    create.mutate(
      {
        ...form,
        reservePrice: form.type === 'english' ? form.reservePrice || undefined : undefined,
        buyNowPrice: form.type === 'english' ? form.buyNowPrice || undefined : undefined,
      },
      {
        onSuccess: (a) => {
          toast.success(t('seller.published'))
          void navigate({ to: '/auctions/$auctionId', params: { auctionId: a.id } })
        },
      },
    )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t('seller.create')}</h1>

      <ol className="flex items-center gap-2">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                i < step
                  ? 'bg-success text-success-foreground'
                  : i === step
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-surface-secondary text-muted'
              }`}
            >
              {i < step ? <CheckIcon weight="bold" /> : i + 1}
            </span>
            <span
              className={`hidden text-sm font-medium sm:inline ${i === step ? '' : 'text-muted'}`}
            >
              {label}
            </span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <Card className="p-6 sm:p-8">
        <Card.Content className="gap-5">
          {step === 0 && (
            <div className="space-y-3">
              <p className="font-semibold">{t('seller.chooseType')}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(['english', 'dutch', 'sealed'] as AuctionType[]).map((type) => {
                  const TypeIcon = TYPE_ICON[type]
                  const active = form.type === type
                  return (
                    <button
                      key={type}
                      onClick={() => patch({ type })}
                      className={`space-y-2 rounded-2xl border-2 p-4 text-left transition ${
                        active
                          ? 'border-foreground bg-accent-soft'
                          : 'border-border hover:border-foreground/50'
                      }`}
                    >
                      <TypeIcon
                        weight="duotone"
                        className={`size-7 ${active ? 'text-brand' : 'text-muted'}`}
                      />
                      <p className="font-semibold">{t(`type.${type}`)}</p>
                      <p className="text-xs text-muted">{t(`type.${type}Desc`)}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <PhotoPicker value={form.images ?? []} onChange={(images) => patch({ images })} />
              <TextField
                value={form.title}
                onChange={(title) => patch({ title })}
                isInvalid={showErrors && form.title.trim().length < 3}
              >
                <Label>{t('seller.itemTitle')}</Label>
                <Input variant="secondary" placeholder="Canon EOS R6 Mark II" />
              </TextField>
              <TextField
                value={form.description}
                onChange={(description) => patch({ description })}
                isInvalid={showErrors && !form.description.trim()}
              >
                <Label>{t('seller.itemDesc')}</Label>
                <TextArea variant="secondary" rows={4} />
              </TextField>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">{t('seller.itemCategory')}</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => patch({ category })}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                        form.category === category
                          ? 'border-ink bg-accent text-accent-foreground shadow-[2px_2px_0_#0a0f0d]'
                          : 'border-border text-muted'
                      }`}
                    >
                      {t(`category.${category}`)}
                    </button>
                  ))}
                </div>
              </div>
              {showErrors && !itemValid && (
                <p className="text-sm text-danger">{t('seller.required')}</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyInput
                id="start"
                label={t('seller.startingPrice')}
                value={form.startingPrice}
                onChange={(startingPrice) => patch({ startingPrice })}
              />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">{t('seller.duration')}</span>
                <input
                  type="number"
                  min={1}
                  value={form.durationMin}
                  onChange={(e) => patch({ durationMin: Number(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-border bg-field px-3 font-semibold outline-none focus:border-foreground"
                />
              </label>
              {form.type === 'english' && (
                <>
                  <MoneyInput
                    id="reserve"
                    label={t('seller.reservePrice')}
                    value={form.reservePrice ?? 0}
                    onChange={(reservePrice) => patch({ reservePrice })}
                  />
                  <MoneyInput
                    id="buynow"
                    label={t('seller.buyNowPrice')}
                    value={form.buyNowPrice ?? 0}
                    onChange={(buyNowPrice) => patch({ buyNowPrice })}
                  />
                </>
              )}
              {form.type === 'dutch' && (
                <>
                  <MoneyInput
                    id="floor"
                    label={t('seller.floorPrice')}
                    value={form.floorPrice ?? 0}
                    onChange={(floorPrice) => patch({ floorPrice })}
                  />
                  <MoneyInput
                    id="dec"
                    label={t('seller.decrement')}
                    value={form.decrement ?? 0}
                    onChange={(decrement) => patch({ decrement })}
                  />
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">{t('seller.interval')}</span>
                    <input
                      type="number"
                      min={5}
                      value={form.intervalSec}
                      onChange={(e) => patch({ intervalSec: Number(e.target.value) })}
                      className="h-11 w-full rounded-xl border border-border bg-field px-3 font-semibold outline-none focus:border-foreground"
                    />
                  </label>
                </>
              )}
              {showErrors && !rulesValid && (
                <p className="text-sm text-danger sm:col-span-2">
                  {form.type === 'dutch' ? t('seller.floorTooHigh') : t('seller.required')}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5 sm:flex-row">
              <CardCarousel
                images={form.images}
                category={form.category}
                alt={form.title}
                className="aspect-[4/3] rounded-2xl border-2 border-ink sm:w-64"
              />
              <div className="flex-1 space-y-2">
                <TypeChip type={form.type} />
                <p className="text-xl font-bold">{form.title}</p>
                <p className="line-clamp-3 text-sm text-muted">{form.description}</p>
                <dl className="grid grid-cols-2 gap-2 pt-2 text-sm">
                  <dt className="text-muted">{t('seller.startingPrice')}</dt>
                  <dd className="tabular font-semibold">{formatRupiah(form.startingPrice)}</dd>
                  <dt className="text-muted">{t('seller.duration')}</dt>
                  <dd className="font-semibold">{form.durationMin}</dd>
                  {form.type === 'dutch' && (
                    <>
                      <dt className="text-muted">{t('seller.floorPrice')}</dt>
                      <dd className="tabular font-semibold">
                        {formatRupiah(form.floorPrice ?? 0)}
                      </dd>
                    </>
                  )}
                  {form.type === 'english' && !!form.reservePrice && (
                    <>
                      <dt className="text-muted">{t('seller.reservePrice')}</dt>
                      <dd className="tabular font-semibold">{formatRupiah(form.reservePrice)}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          )}
        </Card.Content>
        <Card.Footer className="justify-between pt-4">
          <Button variant="ghost" isDisabled={step === 0} onPress={() => setStep((s) => s - 1)}>
            <ArrowLeftIcon /> {t('common.back')}
          </Button>
          {step < 3 ? (
            <Button onPress={next}>
              {t('common.next')} <ArrowRightIcon />
            </Button>
          ) : (
            <Button isPending={create.isPending} onPress={publish}>
              <RocketLaunchIcon weight="fill" /> {t('seller.publish')}
            </Button>
          )}
        </Card.Footer>
      </Card>
    </div>
  )
}
