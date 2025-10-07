'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabaseClient'

interface DashboardSidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function DashboardSidebar({
  activeTab,
  onTabChange,
}: DashboardSidebarProps) {
  const supabase = createClient()
  const navItems = ['Profile Settings', 'Rewards', 'Play History']

  const [internalActiveTab, setInternalActiveTab] = useState(activeTab || navItems[0])
  const [profile, setProfile] = useState<{
    id?: string
    username: string | null
    role: string | null
    user_image: string | null
  }>({
    username: null,
    role: null,
    user_image: null,
  })

  // Load initial profile
  useEffect(() => {
    const loadUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, user_image')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
      }
    }

    loadUserProfile()
  }, [supabase])

  // Subscribe to realtime updates for this user's row
  useEffect(() => {
    if (!profile.id) return

    const channel = supabase
      .channel(`user-updates-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          const updated = payload.new as any
          setProfile((prev) => ({
            ...prev,
            username: updated.username ?? prev.username,
            role: updated.role ?? prev.role,
            user_image: updated.user_image ?? prev.user_image,
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile.id, supabase])

  const handleTabClick = (item: string) => {
    setInternalActiveTab(item)
    onTabChange?.(item)
  }

  const displayUsername = profile.username || 'User'
  const displayRole = profile.role || 'Member'

  return (
    <aside className="w-64 border-r bg-card p-6">
      {/* Profile section */}
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-16 w-16">
          {profile.user_image ? (
            <AvatarImage src={profile.user_image} alt={displayUsername} />
          ) : (
            <AvatarFallback>{displayUsername.charAt(0).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <p className="mt-2 font-semibold">{displayUsername}</p>
        <p className="text-xs text-muted-foreground">{displayRole}</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => handleTabClick(item)}
            className={cn(
              'w-full text-left rounded-md px-3 py-2 text-sm font-medium transition',
              internalActiveTab === item
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            )}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  )
}
