import { Avatar, Button, Card, FieldError, Input, Label, TextField, toast } from '@heroui/react'
import { ShoppingBagIcon, StorefrontIcon } from '@phosphor-icons/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { DEMO_USERS } from '../mocks/seed'
import { login } from '../services/authService'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const signIn = async (address: string) => {
    if (!z.email().safeParse(address).success) {
      setError(true)
      return
    }
    setLoading(address)
    const user = await login(address)
    toast.success(t('auth.welcome', { name: user.name }))
    void navigate({ to: redirect ?? (user.role === 'seller' ? '/sell' : '/auctions') })
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <Card className="p-6 sm:p-8">
        <Card.Header className="mb-2 gap-1.5">
          <Card.Title className="text-2xl font-bold">{t('auth.title')}</Card.Title>
          <Card.Description>{t('auth.subtitle')}</Card.Description>
        </Card.Header>
        <Card.Content>
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              void signIn(email)
            }}
          >
            <TextField
              value={email}
              onChange={(v) => {
                setEmail(v)
                setError(false)
              }}
              isInvalid={error}
              type="email"
            >
              <Label>{t('auth.email')}</Label>
              <Input variant="secondary" placeholder="nama@email.com" />
              <FieldError>{t('auth.invalidEmail')}</FieldError>
            </TextField>
            <TextField value={password} onChange={setPassword} type="password">
              <Label>{t('auth.password')}</Label>
              <Input variant="secondary" placeholder="••••••••" />
            </TextField>
            <Button type="submit" fullWidth isPending={loading === email && !!email}>
              {t('auth.submit')}
            </Button>
          </form>
        </Card.Content>
      </Card>

      <Card variant="secondary" className="p-6 sm:p-8">
        <Card.Header>
          <Card.Title>{t('auth.quick')}</Card.Title>
        </Card.Header>
        <Card.Content className="gap-3">
          {DEMO_USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => void signIn(u.email)}
              disabled={!!loading}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-foreground hover:shadow-sm disabled:opacity-60"
            >
              <Avatar color={u.role === 'seller' ? 'warning' : 'accent'}>
                <Avatar.Fallback>{u.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{u.name}</p>
                <p className="text-xs text-muted">{u.email}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-medium">
                {u.role === 'seller' ? <StorefrontIcon /> : <ShoppingBagIcon />}
                {t(`auth.${u.role}`)}
              </span>
            </button>
          ))}
        </Card.Content>
      </Card>
    </div>
  )
}
