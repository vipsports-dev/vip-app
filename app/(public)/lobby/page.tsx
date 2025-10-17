'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function LobbyPage() {
  const supabase = createClient()

  const [contests, setContests] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState('All')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  // Fetch contests
  useEffect(() => {
    const fetchContests = async () => {
      const { data, error } = await supabase
        .from('contests')
        .select(
          'id, title, description, sports, prize_tickets, state, featured, visibility, banner_image_url, start_time, end_time'
        )
        .eq('state', 'upcoming')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching contests:', error)
      else {
        setContests(data || [])
        setFiltered(data || [])
      }
    }

    fetchContests()
  }, [])

  // Search & filter logic
  useEffect(() => {
    let filteredData = [...contests]

    if (sportFilter !== 'All') {
      filteredData = filteredData.filter((c) =>
        c.sports?.includes(sportFilter)
      )
    }

    if (search.trim() !== '') {
      const lower = search.toLowerCase()
      filteredData = filteredData.filter(
        (c) =>
          c.title.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      )
    }

    setFiltered(filteredData)
  }, [search, sportFilter, contests])

  // Unique sports for filter tabs
  const sports = Array.from(
    new Set(contests.flatMap((c) => c.sports?.length ? c.sports : ['Custom']))
  )

  return (
    <main className="flex flex-col gap-6 px-4 pb-12 pt-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Lobby</h1>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search contests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'list')}>
            <TabsList className="grid grid-cols-2 w-[120px]">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Sports filter */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
        <Button
          variant={sportFilter === 'All' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSportFilter('All')}
        >
          All Sports
        </Button>
        {sports.map((sport) => (
          <Button
            key={sport}
            variant={sportFilter === sport ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSportFilter(sport)}
          >
            {sport}
          </Button>
        ))}
      </div>

      {/* Contest list */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          No contests found.
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((contest) => (
            <Card
              key={contest.id}
              className="overflow-hidden border border-border/40 hover:shadow-md transition-all"
            >
              {contest.banner_image_url && (
                <img
                  src={contest.banner_image_url}
                  alt={`${contest.title} banner`}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-medium text-sm mb-1">{contest.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {contest.description}
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>🎟️ {contest.prize_tickets}</span>
                  <span>{contest.state}</span>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="w-full mt-3"
                >
                  <Link href={`/contest/${contest.id}`}>Enter</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((contest) => (
            <Card
              key={contest.id}
              className="flex items-center justify-between p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                {contest.banner_image_url && (
                  <img
                    src={contest.banner_image_url}
                    alt={`${contest.title} banner`}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-medium text-sm">{contest.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {contest.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  🎟️ {contest.prize_tickets}
                </span>
                <Button asChild size="sm">
                  <Link href={`/contest/${contest.id}`}>Enter</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
