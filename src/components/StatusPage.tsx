import { Button } from '@heroui/react'
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  GavelIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Marker, ScriptNote } from './brand'
import { LinkButton } from './LinkButton'

function StatusLayout({
  code,
  note,
  lead,
  mark,
  body,
  icon,
  actions,
  children,
}: {
  code: string
  note: string
  lead: string
  mark: string
  body: string
  icon: React.ReactNode
  actions: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="grid min-h-[60vh] items-center gap-12 py-8 md:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <ScriptNote>{note}</ScriptNote>
        <h1 className="text-5xl font-extrabold leading-[1] tracking-[-0.045em] sm:text-6xl">
          {lead} <Marker>{mark}</Marker>
        </h1>
        <p className="max-w-lg text-lg text-muted">{body}</p>
        <div className="flex flex-wrap items-center gap-4 pt-2">{actions}</div>
        {children}
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 8 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ type: 'spring', stiffness: 110, damping: 13 }}
          className="grid-paper relative rounded-3xl border-2 border-ink bg-white p-8 text-ink shadow-[8px_8px_0_#0a0f0d]"
        >
          <span className="inline-block rounded-full border-2 border-ink bg-lime px-3 py-0.5 text-xs font-extrabold">
            {code}
          </span>
          <p className="mt-4 text-[7rem] font-extrabold leading-none tracking-[-0.06em]">{code}</p>
          <div className="mt-4 flex items-center gap-3 text-ink/70">{icon}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 12 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
          className="absolute -right-4 -top-6 grid size-16 place-items-center rounded-2xl border-2 border-ink bg-lime text-ink shadow-[4px_4px_0_#0a0f0d]"
        >
          <GavelIcon weight="fill" className="size-8" />
        </motion.div>
      </div>
    </section>
  )
}

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <StatusLayout
      code="404"
      note={t('page.notFoundNote')}
      lead={t('page.notFoundLead')}
      mark={t('page.notFoundMark')}
      body={t('page.notFoundBody')}
      icon={
        <>
          <MagnifyingGlassIcon weight="bold" className="size-6" />
          <span className="script text-2xl text-ink/70">{t('page.notFoundCard')}</span>
        </>
      }
      actions={
        <>
          <LinkButton to="/auctions" size="lg">
            <GavelIcon weight="bold" /> {t('page.browse')}
          </LinkButton>
          <LinkButton to="/" size="lg" variant="secondary">
            <HouseIcon weight="bold" /> {t('page.home')}
          </LinkButton>
        </>
      }
    />
  )
}

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <StatusLayout
      code="500"
      note={t('page.errorNote')}
      lead={t('page.errorLead')}
      mark={t('page.errorMark')}
      body={t('page.errorBody')}
      icon={
        <>
          <WarningIcon weight="bold" className="size-6" />
          <span className="script text-2xl text-ink/70">{t('page.errorCard')}</span>
        </>
      }
      actions={
        <>
          <Button
            size="lg"
            onPress={() => {
              reset()
              void router.invalidate()
            }}
          >
            <ArrowClockwiseIcon weight="bold" /> {t('page.retry')}
          </Button>
          <Button size="lg" variant="secondary" onPress={() => router.history.back()}>
            <ArrowLeftIcon weight="bold" /> {t('common.back')}
          </Button>
        </>
      }
    >
      {import.meta.env.DEV && error instanceof Error && (
        <details className="max-w-lg rounded-xl border-2 border-dashed border-border p-3 text-xs text-muted">
          <summary className="cursor-pointer font-bold">{t('page.details')}</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words">{error.message}</pre>
        </details>
      )}
    </StatusLayout>
  )
}
