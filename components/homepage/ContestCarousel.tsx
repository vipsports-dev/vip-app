'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ContestCarousel({
  sport,
  contests,
}: {
  sport: string
  contests: any[]
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold tracking-tight">{sport} Contests</h2>
        <Button asChild variant="ghost" className="text-xs">
          <Link href={`/lobby?sport=${encodeURIComponent(sport)}`}>View all</Link>
        </Button>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {contests.map((contest) => (
            <Card
              key={contest.id}
              className="min-w-[250px] flex-shrink-0 border border-border/40 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {contest.banner_image_url && (
                <img
                  src={contest.banner_image_url}
                  alt={`${contest.title} banner`}
                  className="w-full h-28 object-cover"
                />
              )}
              <div className="p-3">
                <h3 className="font-medium text-sm mb-1">{contest.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {contest.description}
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>🎟️ {contest.prize_tickets}</span>
                  <span>{contest.state}</span>
                </div>
                <Button asChild size="sm" className="w-full mt-2">
                  <Link href={`/contest/${contest.id}`}>Enter</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {canScrollPrev && (
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          className="absolute top-1/2 -left-2 -translate-y-1/2 bg-background/70 backdrop-blur-sm rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}
      {canScrollNext && (
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          className="absolute top-1/2 -right-2 -translate-y-1/2 bg-background/70 backdrop-blur-sm rounded-full"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
