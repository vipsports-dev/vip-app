// lib/supabaseServer.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Return all cookies to Supabase
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Update cookies during auth events (sign-in/out)
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set({ name, value, ...options })
            } catch {
              // Ignore write errors during SSR
            }
          })
        },
      },
    }
  )
}