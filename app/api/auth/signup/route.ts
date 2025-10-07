// app/api/signup/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
)

type Body = {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string | null
  dob: string
  referrerUsername: string
  role?: 'basic_member' | 'vip_member' | 'admin'
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const {
      username, email, password, firstName, lastName, phone, dob, referrerUsername, role
    } = body

    // 0) Re-validate minimally on server (don’t trust client)
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json({ message: 'Invalid username' }, { status: 400 })
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 })
    }

    // 1) Resolve referrer on server (don’t trust client referrerId)
    const { data: ref } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('username', referrerUsername)
      .maybeSingle()

    // Non-admins must have valid referrer; admins can skip (your trigger enforces this too)
    const referrerId: string | null = ref?.id ?? null

    // 2) Create Auth user (password is securely stored by Supabase)
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: 400 })
    }
    const authId = authData.user.id

    // 3) Insert public profile; if it fails, roll back the Auth user
    const { error: insertErr } = await supabase.from('users').insert({
      id: authId,
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone ?? null,
      date_of_birth: dob,
      user_image: null,
      referrer_id: referrerId,
      role: role ?? 'basic_member',
    })

    if (insertErr) {
      // rollback
      await supabase.auth.admin.deleteUser(authId)
      return NextResponse.json({ message: insertErr.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Unknown error' }, { status: 400 })
  }
}
