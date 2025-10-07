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

export default function SiteHeader() {
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [userImage, setUserImage] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!session) return
    ;(async () => {
      const { data } = await supabase
        .from('users')
        .select('username, user_image')
        .eq('id', session.user.id)
        .maybeSingle()
      if (data) {
        setUsername(data.username)
        setUserImage(data.user_image)
      }
    })()
  }, [session, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="border-b bg-white/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        {/* --- Left: Logo --- */}
        <Link href="/" className="text-xl font-semibold tracking-tight">
          VIP Sports
        </Link>

        {/* --- Middle: Global Nav --- */}
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
        </nav>

        {/* --- Right: Auth Buttons or Avatar --- */}
        {!session ? (
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <UserAvatar username={username || 'U'} imageUrl={userImage} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-gray-700 flex items-center gap-3">
                <UserAvatar username={username || 'U'} imageUrl={userImage} />
                {username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
