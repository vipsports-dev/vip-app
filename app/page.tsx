import { createServerSupabaseClient } from '@/lib/supabaseServer'
import HeroCarousel from '@/components/homepage/HeroCarousel'
import SportsNav from '@/components/homepage/SportsNav'
import ContestCarousel from '@/components/homepage/ContestCarousel'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  // Fetch active homepage slides
  const { data: slides, error: slidesError } = await supabase
    .from('homepage_slides')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (slidesError) console.error('Error fetching slides:', slidesError)

  // Fetch upcoming & public contests (for carousels)
  const { data: contests, error: contestsError } = await supabase
    .from('contests')
    .select(
      'id, title, description, sports, prize_tickets, state, featured, visibility, banner_image_url, start_time, end_time'
    )
    .eq('state', 'upcoming')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (contestsError) console.error('Error fetching contests:', contestsError)

  // Group contests by sport
  const groupedBySport =
    contests?.reduce((acc: Record<string, any[]>, contest) => {
      const sports = contest.sports?.length ? contest.sports : ['Custom']
      for (const sport of sports) {
        acc[sport] = acc[sport] || []
        acc[sport].push(contest)
      }
      return acc
    }, {}) || {}

  return (
    <main className="flex flex-col gap-8 pb-12">
      {/* Hero carousel */}
      <section className="w-full border-b border-border">
        <HeroCarousel slides={slides || []} />
      </section>

      {/* Sports navigation */}
      <section className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <SportsNav />
        </div>
      </section>

      {/* Contest carousels */}
      <section className="max-w-6xl mx-auto w-full space-y-8 px-4 pt-4">
        {Object.entries(groupedBySport).map(([sport, contests]) => (
          <ContestCarousel key={sport} sport={sport} contests={contests} />
        ))}

        {Object.keys(groupedBySport).length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">
            No upcoming contests available right now. Check back soon!
          </div>
        )}
      </section>
    </main>
  )
}
