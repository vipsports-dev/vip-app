// app/components/lobby/LobbyClient.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import type { Contest, ContestType, Sport, Visibility } from '@/lib/repos/contests'
import { fetchContestsMock } from '@/lib/repos/contests'

const ALL = 'All'

const SPORTS: (Sport | typeof ALL)[] = [ALL, 'NFL', 'NBA', 'MLB', 'NHL', 'UFC', 'Soccer']
const TYPES: (ContestType | typeof ALL)[] = [ALL, 'Pick-Em', 'Parlay', 'Bracket', 'Fantasy']
const VISIBILITIES: (Visibility | typeof ALL)[] = [ALL, 'public', 'private']

export default function LobbyClient({ initialSport }: { initialSport?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sport, setSport] = useState<string>(initialSport || searchParams.get('sport') || ALL)
  const [contestType, setContestType] = useState<string>(ALL)
  const [visibility, setVisibility] = useState<string>(ALL)
  const [data, setData] = useState<Contest[]>([])

  useEffect(() => {
    fetchContestsMock().then(setData)
  }, [])

  useEffect(() => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()))
    if (sport && sport !== ALL) sp.set('sport', sport)
    else sp.delete('sport')
    router.replace(`/lobby?${sp.toString()}`, { scroll: false })
  }, [sport])

  const filtered = useMemo(() => {
    return data.filter((contest) => {
      const sportOk = sport === ALL || contest.sport === sport
      const typeOk = contestType === ALL || contest.type === contestType
      const visOk = visibility === ALL || contest.visibility === visibility
      return sportOk && typeOk && visOk
    })
  }, [data, sport, contestType, visibility])

  return (
    <main className="p-4 space-y-4">
      {/* Filters */}
      <section className="flex flex-wrap gap-3 items-center">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v as 'grid' | 'list')}
        >
          <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
        </ToggleGroup>

        <Select value={sport} onValueChange={setSport}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sport" />
          </SelectTrigger>
          <SelectContent>
            {SPORTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={contestType} onValueChange={setContestType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITIES.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Results */}
      {view === 'grid' ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((contest) => (
            <Card key={contest.id} className="p-4">
              <div className="text-sm text-muted-foreground">
                {contest.sport} • {contest.type} • {contest.visibility}
              </div>
              <h3 className="font-semibold">{contest.title}</h3>
              <div className="text-xs text-muted-foreground">
                Entries: {contest.entries}
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <section className="space-y-2">
          {filtered.map((contest) => (
            <Card key={contest.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {contest.sport} • {contest.type} • {contest.visibility}
                  </div>
                  <div className="font-semibold">{contest.title}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Entries: {contest.entries}
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </main>
  )
}
