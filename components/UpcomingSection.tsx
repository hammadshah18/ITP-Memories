'use client'

import { useEffect, useRef } from 'react'
import { UPCOMING_EVENTS } from '@/lib/data'

export default function UpcomingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const upcomingImages = ['/images/pic7.jpeg', '/images/pic8.jpeg', '/images/pic6.jpeg']

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('revealed')
      }),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="upcoming" ref={sectionRef} className="py-32 bg-surface-container-low/40 overflow-hidden">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16 reveal-up">
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary/60 font-bold mb-4">
            What&apos;s Ahead
          </p>
          <h2 className="font-headline text-6xl lg:text-7xl italic text-on-surface">
            Upcoming
            <br />
            <span className="gradient-text">Chapters</span>
          </h2>
          <p className="text-on-surface-variant/60 mt-4 text-sm">
            The horizon is bright with new memories waiting to be made.
          </p>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Large featured */}
          <div className="md:row-span-2 bg-on-surface/[0.03] rounded-3xl p-8 flex flex-col justify-between reveal-left min-h-[280px] relative overflow-hidden group hover:bg-primary-fixed/20 transition-colors duration-500">
            <img
              src={upcomingImages[0]}
              alt={UPCOMING_EVENTS[0].title}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-35 group-hover:opacity-45 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-sm">star</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-primary font-bold">
                  {UPCOMING_EVENTS[0].status}
                </span>
              </div>
              <h3 className="font-headline text-3xl italic text-on-surface mb-2">
                {UPCOMING_EVENTS[0].title}
              </h3>
              <p className="text-on-surface-variant/60 text-sm">{UPCOMING_EVENTS[0].subtitle}</p>
            </div>

            {/* Decorative floating circles */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-primary-fixed/30 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-primary-container/40" />
          </div>

          {UPCOMING_EVENTS.slice(1).map((event, i) => (
            <div
              key={event.id}
              className={`
                bg-on-surface/[0.03] rounded-3xl p-6 relative overflow-hidden group
                hover:bg-primary-fixed/15 transition-colors duration-500
                ${i === 0 ? 'reveal-right' : 'reveal-right'}
              `}
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              <img
                src={upcomingImages[i + 1]}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-25 group-hover:opacity-35 transition-opacity duration-500"
              />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">event</span>
                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
                    {event.status}
                  </span>
                </div>
              </div>
              <h3 className="font-headline text-xl italic text-on-surface mb-2">{event.title}</h3>
              <p className="text-on-surface-variant/60 text-xs leading-relaxed">{event.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
