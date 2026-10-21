import {
  CheckCircleIcon,
  EyeSlashIcon,
  GavelIcon,
  HeartIcon,
  RobotIcon,
  TimerIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Display, Marker, ScriptNote } from './brand'

const STEPS = ['01', '02', '03', '04'] as const

/** Mock UI for each step, drawn on grid paper like the reference design. */
function StepVisual({ step }: { step: number }) {
  const { t } = useTranslation()
  const bubble =
    'rounded-xl border-2 border-ink px-3 py-2 text-sm font-bold shadow-[3px_3px_0_#0a0f0d]'

  if (step === 0) {
    const rows = [
      { icon: TrendUpIcon, label: t('type.english') },
      { icon: TrendDownIcon, label: t('type.dutch') },
      { icon: EyeSlashIcon, label: t('type.sealed') },
    ]
    return (
      <div className="space-y-3">
        {rows.map(({ icon: RowIcon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: 30, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: i % 2 ? 1 : -1 }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 140, damping: 16 }}
            className={`flex items-center justify-between bg-white ${bubble}`}
          >
            <span className="flex items-center gap-2">
              <RowIcon weight="bold" /> {label}
            </span>
            <HeartIcon
              weight={i === 0 ? 'fill' : 'regular'}
              className={i === 0 ? 'text-danger' : ''}
            />
          </motion.div>
        ))}
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`ml-auto w-fit bg-lime ${bubble}`}
        >
          {t('common.you')} · Rp 17.600.000
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`flex w-fit items-center gap-2 bg-ink text-paper ${bubble}`}
        >
          <RobotIcon weight="fill" className="text-lime" /> Andi ({t('auction.auto')}) · Rp
          17.700.000
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="caret rounded-xl border-2 border-dashed border-ink/40 bg-white px-3 py-2 text-sm text-muted"
        >
          {t('how.proxyTyping')}
        </motion.div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative rounded-2xl border-2 border-ink bg-ink px-6 py-4 font-extrabold text-lime shadow-[4px_4px_0_#d6ee30]">
          <span className="flex items-center gap-2 text-4xl tabular">
            <TimerIcon weight="bold" /> 00:00:12
          </span>
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 8 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 12 }}
            className="absolute -right-6 -top-5 rounded-full border-2 border-ink bg-lime px-3 py-1 text-sm text-ink"
          >
            +60s
          </motion.span>
        </div>
        <p className="script text-2xl">{t('how.snipeNote')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
        animate={{ scale: 1, opacity: 1, rotate: -8 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className="rounded-2xl border-4 border-ink bg-lime px-8 py-3 text-5xl font-extrabold tracking-[-0.04em] text-ink shadow-[6px_6px_0_#0a0f0d]"
      >
        SOLD!
      </motion.div>
      <p className="flex items-center gap-2 text-sm font-bold">
        <CheckCircleIcon weight="fill" className="text-success" /> {t('how.winNote')}
      </p>
    </div>
  )
}

export function HowItWorks() {
  const { t } = useTranslation()
  const [active, setActive] = useState(0)
  const steps = STEPS.map((n, i) => ({
    n,
    tag: t(`how.s${i + 1}Tag` as 'how.s1Tag'),
    title: t(`how.s${i + 1}Title` as 'how.s1Title'),
    body: t(`how.s${i + 1}Body` as 'how.s1Body'),
  }))

  return (
    <section id="how" className="scroll-mt-28 space-y-10">
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div className="space-y-3">
          <ScriptNote>{t('how.note')}</ScriptNote>
          <Display>
            {t('how.titleLead')} <Marker>{t('how.titleMark')}</Marker>
          </Display>
        </div>
        <p className="text-muted md:pb-2">{t('how.intro')}</p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              onViewportEnter={() => setActive(i)}
              viewport={{ amount: 0.6 }}
              className="flex min-h-[60vh] flex-col justify-center gap-3 py-8 md:min-h-[70vh]"
            >
              <p className="flex items-center gap-3">
                <span className="rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-paper dark:bg-lime dark:text-ink">
                  {s.n}
                </span>
                <span className="script text-2xl">{s.tag}</span>
              </p>
              <h3 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-4xl">
                {s.title}
              </h3>
              <p className="max-w-md text-muted">{s.body}</p>
              {/* On small screens the visual sits inline under its step. */}
              <div className="grid-paper mt-4 rounded-2xl border-2 border-ink bg-white p-6 text-ink md:hidden">
                <StepVisual step={i} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="hidden md:block">
          <div className="sticky top-32 space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <span>{t('how.start')}</span>
              <div className="relative flex flex-1 items-center justify-between">
                <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
                <motion.div
                  className="absolute left-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink dark:bg-lime"
                  animate={{
                    width: `calc(${(active / (STEPS.length - 1)) * 100}% - ${(active / (STEPS.length - 1)) * 2}rem)`,
                  }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                />
                {STEPS.map((n, i) => (
                  <motion.span
                    key={n}
                    animate={{ scale: i === active ? 1.2 : 1 }}
                    className={`relative grid size-9 place-items-center rounded-full border-2 text-xs font-extrabold transition-colors ${
                      i === active
                        ? 'border-ink bg-lime text-ink shadow-[2px_2px_0_#0a0f0d]'
                        : i < active
                          ? 'border-ink bg-ink text-paper dark:border-lime dark:bg-lime dark:text-ink'
                          : 'border-border bg-surface text-muted'
                    }`}
                  >
                    {n}
                  </motion.span>
                ))}
              </div>
              <span className="flex items-center gap-1">
                <GavelIcon weight="fill" /> {t('how.end')}
              </span>
            </div>

            <div className="grid-paper relative min-h-[22rem] overflow-hidden rounded-3xl border-2 border-ink bg-[#fbfcf7] p-8 text-ink shadow-[6px_6px_0_var(--card-shadow)]">
              <div className="mb-8 flex items-center justify-between">
                <p className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-[-0.04em]">
                    {STEPS[active]}
                  </span>
                  <span className="script text-2xl">{steps[active].tag}</span>
                </p>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                  transition={{ duration: 0.35 }}
                >
                  <StepVisual step={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
