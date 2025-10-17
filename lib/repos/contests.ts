// app/lib/repos/contests.ts
export type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'UFC' | 'Soccer'
export type ContestType = 'Pick-Em' | 'Parlay' | 'Bracket' | 'Fantasy'
export type Visibility = 'public' | 'private'

export type Contest = {
  id: string
  title: string
  sport: Sport
  type: ContestType
  visibility: Visibility
  entries: number
}

const MOCK_CONTESTS: Contest[] = [
  {
    id: '1',
    title: 'NFL Sunday Pick-Em',
    sport: 'NFL',
    type: 'Pick-Em',
    visibility: 'public',
    entries: 128,
  },
  {
    id: '2',
    title: 'NBA Night Parlay',
    sport: 'NBA',
    type: 'Parlay',
    visibility: 'public',
    entries: 84,
  },
  {
    id: '3',
    title: 'VIP UFC Picks',
    sport: 'UFC',
    type: 'Pick-Em',
    visibility: 'private',
    entries: 22,
  },
  {
    id: '4',
    title: 'MLB Bracket Bash',
    sport: 'MLB',
    type: 'Bracket',
    visibility: 'public',
    entries: 46,
  },
]

export async function fetchContestsMock(): Promise<Contest[]> {
  // Later we’ll replace this with a Supabase query
  return MOCK_CONTESTS
}
