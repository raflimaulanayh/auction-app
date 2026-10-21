import { Avatar, Button, toast } from '@heroui/react'
import {
  ArrowCounterClockwiseIcon,
  FlaskIcon,
  GavelIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SignOutIcon,
  StorefrontIcon,
  SunIcon,
  TranslateIcon,
} from '@phosphor-icons/react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatRupiah } from '../lib/money'
import { useRealtime } from '../lib/realtime'
import { useDb } from '../mocks/db'
import { logout, useSession } from '../services/authService'
import { keys } from '../services/queries'
import { useTheme } from '../theme'
import { LinkButton } from './LinkButton'

function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const next = i18n.resolvedLanguage === 'en' ? 'id' : 'en'
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t('common.language')}
      onPress={() => void i18n.changeLanguage(next)}
    >
      <TranslateIcon weight="bold" />
      <span className="font-semibold uppercase">{i18n.resolvedLanguage}</span>
    </Button>
  )
}

function ThemeToggle() {
  const { t } = useTranslation()
  const { dark, toggle } = useTheme()
  return (
    <Button variant="ghost" size="sm" isIconOnly aria-label={t('common.darkMode')} onPress={toggle}>
      {dark ? <SunIcon weight="bold" /> : <MoonIcon weight="bold" />}
    </Button>
  )
}

function SearchBox() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  return (
    <form
      className="relative hidden flex-1 md:block md:max-w-sm"
      onSubmit={(e) => {
        e.preventDefault()
        void navigate({ to: '/auctions', search: { q: q || undefined } })
      }}
    >
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('common.search')}
        className="h-9 w-full rounded-full border border-border bg-surface pl-9 pr-4 text-sm outline-none transition focus:border-foreground"
      />
    </form>
  )
}

const navLink =
  'flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-transparent px-3.5 py-1.5 text-sm font-bold text-foreground/75 transition hover:text-foreground [&.active]:border-ink [&.active]:bg-lime [&.active]:text-ink [&.active]:shadow-[2px_2px_0_#0a0f0d]'

/** Keeps every query fresh when the "server" (demo db) changes and surfaces outbid alerts. */
function LiveSync() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const userId = useSession((s) => s.user?.id)
  useEffect(() => useDb.subscribe(() => void qc.invalidateQueries({ queryKey: keys.all })), [qc])
  useRealtime((e) => {
    if (e.type === 'Outbid' && e.userId === userId) {
      toast.warning(t('english.outbidToast', { title: e.title, amount: formatRupiah(e.amount) }))
    }
  })
  return null
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const user = useSession((s) => s.user)
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col">
      <LiveSync />
      <div className="flex items-center justify-center gap-2 bg-forest px-4 py-1.5 text-center text-xs font-semibold text-lime">
        <FlaskIcon weight="bold" />
        {t('common.demoBanner')}
      </div>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link
            to="/"
            className="group flex items-center gap-2 text-xl font-extrabold tracking-[-0.04em]"
          >
            <span className="grid size-9 -rotate-6 place-items-center rounded-xl border-2 border-ink bg-lime text-ink shadow-[2px_2px_0_#0a0f0d] transition group-hover:rotate-6">
              <GavelIcon weight="fill" />
            </span>
            {t('common.appName')}
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            <Link to="/auctions" className={navLink}>
              {t('common.auctions')}
            </Link>
            {user && (
              <>
                <Link to="/me/bids" className={navLink}>
                  {t('common.myBids')}
                </Link>
                <Link to="/me/watchlist" className={navLink}>
                  <HeartIcon />
                  {t('common.watchlist')}
                </Link>
              </>
            )}
            {user?.role === 'seller' && (
              <Link to="/sell" className={navLink}>
                <StorefrontIcon />
                {t('common.sell')}
              </Link>
            )}
          </nav>
          <div className="flex flex-1 items-center justify-end gap-1">
            <SearchBox />
            <LanguageSwitcher />
            <ThemeToggle />
            {user ? (
              <div className="ml-1 flex items-center gap-1">
                <Avatar size="sm" color="accent">
                  <Avatar.Fallback>{user.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar>
                <span className="hidden text-sm font-medium xl:inline">{user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label={t('common.resetDemo')}
                  onPress={() => {
                    useDb.getState().reset()
                    toast.success(t('common.resetDone'))
                  }}
                >
                  <ArrowCounterClockwiseIcon weight="bold" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label={t('common.logout')}
                  onPress={() => {
                    logout()
                    void navigate({ to: '/' })
                  }}
                >
                  <SignOutIcon weight="bold" />
                </Button>
              </div>
            ) : (
              <LinkButton
                to="/login"
                size="sm"
                className="ml-1 bg-ink text-paper dark:bg-lime dark:text-ink"
              >
                {t('common.login')}
              </LinkButton>
            )}
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
          <Link to="/auctions" className={navLink}>
            {t('common.auctions')}
          </Link>
          {user && (
            <>
              <Link to="/me/bids" className={navLink}>
                {t('common.myBids')}
              </Link>
              <Link to="/me/watchlist" className={navLink}>
                {t('common.watchlist')}
              </Link>
            </>
          )}
          {user?.role === 'seller' && (
            <Link to="/sell" className={navLink}>
              {t('common.sell')}
            </Link>
          )}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
      <footer className="grid-forest mt-16 text-paper">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-2xl font-extrabold tracking-[-0.04em]">
              <span className="grid size-9 -rotate-6 place-items-center rounded-xl border-2 border-ink bg-lime text-ink">
                <GavelIcon weight="fill" />
              </span>
              {t('common.appName')}
            </p>
            <p className="script -rotate-1 text-2xl text-lime">{t('common.tagline')}</p>
          </div>
          <p className="text-xs text-paper/60">© 2026 {t('common.appName')}</p>
        </div>
      </footer>
    </div>
  )
}
