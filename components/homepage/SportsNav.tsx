// app/components/homepage/SportsNav.tsx
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import type { Sport } from '@/lib/repos/contests'

const SPORTS: Sport[] = ['NFL', 'NBA', 'MLB', 'NHL', 'UFC', 'Soccer']

export default function SportsNav() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 p-4">
        {SPORTS.map((sport) => (
          <Link key={sport} href={`/lobby?sport=${encodeURIComponent(sport)}`}>
            <Card className="p-4 text-center cursor-pointer hover:shadow-md transition">
              <span className="text-sm font-medium">{sport}</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
