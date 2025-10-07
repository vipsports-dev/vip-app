'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface UserProfile {
  email: string | null
  username: string | null
  role: string | null
  created_at: string | null
}

interface DashboardContentProps {
  activeTab: string
}

export default function DashboardContent({ activeTab }: DashboardContentProps) {
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user profile from Supabase
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('email, username, role, created_at')
        .eq('id', session.user.id)
        .maybeSingle<UserProfile>()

      if (error) {
        console.error('Error loading profile:', error)
      }

      setProfile(data ?? null)
      setLoading(false)
    }

    loadUserProfile()
  }, [supabase])

  const dummyRewards = [
    { id: 1, type: 'Referral Bonus', amount: '50 tickets', date: '2024-09-01' },
    { id: 2, type: 'Contest Win', amount: '120 tickets', date: '2024-09-15' },
  ]

  const dummyHistory = [
    { id: 1, contest: 'NFL Week 1 Pick’em', result: '8/10 correct' },
    { id: 2, contest: 'UFC Main Card', result: '3/5 correct' },
  ]

  // --- Loading & Empty States ---
  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-muted-foreground">
        No profile found.
      </div>
    )
  }

  // --- Tab-based Rendering ---
  switch (activeTab) {
    case 'Profile Settings':
      return (
        <div className="flex-1 p-8 bg-background overflow-y-auto">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{profile.email || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Username</p>
                  <p>{profile.username || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p>
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p>{profile.role || 'Member'}</p>
                </div>
              </div>

              {profile.role === 'Basic Member' && (
                <Button className="mt-4" variant="default">
                  Upgrade to VIP
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )

    case 'Rewards':
      return (
        <div className="flex-1 p-8 bg-background overflow-y-auto">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              {dummyRewards.map((reward) => (
                <div key={reward.id}>
                  <div className="flex justify-between">
                    <p>{reward.type}</p>
                    <p className="text-primary font-medium">{reward.amount}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{reward.date}</p>
                  <Separator className="my-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )

    case 'Play History':
      return (
        <div className="flex-1 p-8 bg-background overflow-y-auto">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Play History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dummyHistory.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <p>{item.contest}</p>
                  <p className="font-medium text-muted-foreground">{item.result}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )

    default:
      return (
        <div className="flex-1 p-8 bg-background flex items-center justify-center text-muted-foreground">
          Select a tab to view content
        </div>
      )
  }
}
