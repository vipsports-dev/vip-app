// lib/auth.ts
import { redirect } from 'next/navigation'

export function redirectAfterLogin(searchParams: URLSearchParams) {
  const redirectedFrom = searchParams.get('redirectedFrom')
  redirect(redirectedFrom || '/dashboard')
}
