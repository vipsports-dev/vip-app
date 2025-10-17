'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HeroCarousel({ slides }: { slides: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi])

  return (
    <div className="relative max-w-6xl mx-auto px-4">
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] relative select-none"
            >
              <img
                src={slide.image_url}
                alt={slide.title}
                className="w-full h-[350px] object-cover rounded-xl"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 rounded-xl text-white">
                <h2 className="text-2xl font-semibold">{slide.title}</h2>
                {slide.subtitle && (
                  <p className="text-sm text-white/80 mb-3">{slide.subtitle}</p>
                )}
                {slide.cta_href && (
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="w-fit"
                  >
                    <Link href={slide.cta_href}>{slide.cta_label || 'View'}</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollPrev}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-background/70 backdrop-blur-sm rounded-full"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollNext}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/70 backdrop-blur-sm rounded-full"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === selectedIndex ? 'bg-primary w-4' : 'bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
