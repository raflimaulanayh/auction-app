import { redirect } from '@tanstack/react-router'
import { useSession } from '../services/authService'

/** `beforeLoad` guard for pages that need a signed-in user. */
export function requireAuth({ location }: { location: { href: string } }) {
  if (!useSession.getState().user) {
    throw redirect({ to: '/login', search: { redirect: location.href } })
  }
}
