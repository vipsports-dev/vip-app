'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'
import UserAvatar from '@/components/profile/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

type UserProfile = {
  username: string
  user_image: string | null
  role: string
}

export default function SiteHeader() {
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // --- Listen for auth state changes and maintain session ---
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('❌ Error getting session:', error.message)
        setLoading(false)
        return
      }

      if (data?.session) {
        console.log('✅ Session found:', data.session.user.id)
        setSession(data.session)
      } else {
        console.warn('⚠️ No active session found.')
        setSession(null)
      }
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔁 Auth state changed:', _event, session?.user?.id)
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // --- Fetch user profile from public.users when session is ready ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) {
        console.log('⚠️ No session or user ID yet, skipping profile fetch.')
        setLoading(false)
        return
      }

      console.log('🔍 Fetching user profile for ID:', session.user.id)

      const { data, error } = await supabase
        .from('users')
        .select('username, user_image, role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('❌ Error fetching user profile:', error)
      } else if (!data) {
        console.warn('⚠️ No user profile found in public.users for this ID')
      } else {
        console.log('✅ User profile loaded:', data)
        setProfile(data)
      }

      setLoading(false)
    }

    // Run only when a valid session appears
    if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session, supabase])

  // --- Logout handler ---
  const handleLogout = async () => {
    console.log('👋 Logging out...')
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setLoading(false)
    window.location.href = '/'
  }

  return (
    <header className="border-b bg-background/90 backdrop-blur-sm">
      <div className="w-full flex items-center justify-between px-3 md:px-4 py-3">
        {/* --- Left: Logo --- */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight hover:text-primary transition"
        >
          VIP Sports
        </Link>

        {/* --- Middle: Navigation --- */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            Home
          </Link>
          <Link
            href="/lobby"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            Lobby
          </Link>
          {profile?.role === 'admin' && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* --- Right: Auth Section --- */}
        <div className="flex items-center">
          {loading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : !session ? (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          ) : profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <UserAvatar
                    username={profile.username}
                    imageUrl={profile.user_image}
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="flex items-center gap-3">
                  <UserAvatar
                    username={profile.username}
                    imageUrl={profile.user_image}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm leading-tight">
                      {profile.username}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {profile.role}
                    </span>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>

                {profile.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted" />
          )}
        </div>
      </div>
    </header>
  )
}
