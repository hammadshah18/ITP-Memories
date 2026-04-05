'use client'

import { useEffect, useRef } from 'react'
import { TIMELINE_EVENTS } from '@/lib/data'
import { formatDateShort } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function TimelineSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const timelineImages = ['/images/pic6.jpeg', '/images/pic7.jpeg', '/images/pic8.jpeg']

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('revealed')
      }),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const typeConfig = {
    milestone: { icon: 'star', bg: 'bg-primary', text: 'text-on-primary', ring: 'ring-4 ring-primary-fixed' },
    memory: { icon: 'photo_camera', bg: 'bg-secondary', text: 'text-on-secondary', ring: '' },
    upcoming: { icon: 'schedule', bg: 'bg-surface-container-high', text: 'text-on-surface-variant', ring: 'ring-2 ring-dashed ring-outline-variant/60' },
  }

  const groupedByYear = TIMELINE_EVENTS.reduce<Record<string, typeof TIMELINE_EVENTS>>((acc, event) => {
    const year = new Date(event.date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(event)
    return acc
  }, {})

  const years = Object.keys(groupedByYear).sort((a, b) => Number(a) - Number(b))

  return (
    <section id="timeline" ref={sectionRef} className="relative py-32 bg-surface-container-low/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal-up">
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary/60 font-bold mb-4">
            Our Journey
          </p>
          <h2 className="font-headline text-6xl lg:text-7xl italic text-on-surface">
            The Road
            <br />
            <span className="gradient-text">We&apos;ve Walked</span>
          </h2>
          <p className="text-on-surface-variant/60 mt-4 text-sm max-w-md mx-auto">
            From August 15, 2023 — the day four paths became one — to today and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 reveal-up">
          {timelineImages.map((image, i) => (
            <div key={image} className="h-36 rounded-2xl overflow-hidden border border-white/40 shadow-ambient-md">
              <img
                src={image}
                alt={`Timeline memory ${i + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {years.map((year, yearIndex) => (
          <motion.div
            key={year}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: yearIndex * 0.05 }}
            className="mb-12"
          >
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary">{year}</span>
            </div>

            <div
              ref={scrollRef}
              className="overflow-x-auto pb-8 reveal-up"
              style={{ scrollbarWidth: 'thin' }}
            >
              <div className="relative flex items-center gap-0 min-w-max px-8">
                <div className="absolute top-[52px] left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-fixed to-transparent" />

                {groupedByYear[year].map((event, i) => {
                  const cfg = typeConfig[event.type]
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 18, rotateX: 8 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.45, delay: i * 0.05 }}
                      className="flex flex-col items-center relative group"
                      style={{ minWidth: 180 }}
                    >
                      <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/50 font-bold mb-3 whitespace-nowrap">
                        {formatDateShort(event.date)}
                      </p>

                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center z-10
                        transition-all duration-300 group-hover:scale-125
                        ${cfg.bg} ${cfg.ring}
                      `}>
                        <span className={`material-symbols-outlined text-lg ${cfg.text}`}>
                          {cfg.icon}
                        </span>
                      </div>

                      {i < groupedByYear[year].length - 1 && (
                        <div className="absolute top-[52px] left-1/2 w-full h-0.5 bg-primary-fixed/40" />
                      )}

                      <div className="mt-4 text-center px-2 max-w-[160px]">
                        <p className={`
                          font-headline text-sm italic leading-tight mb-1
                          ${event.type === 'milestone' ? 'text-primary font-bold' : 'text-on-surface'}
                          ${event.type === 'upcoming' ? 'text-on-surface-variant/60' : ''}
                        `}>
                          {event.title}
                        </p>
                        <p className="text-[10px] text-on-surface-variant/50 leading-relaxed line-clamp-2">
                          {event.description}
                        </p>

                        {event.type === 'upcoming' && (
                          <span className="inline-block mt-1 text-[8px] uppercase tracking-widest bg-surface-container text-on-surface-variant/60 px-2 py-0.5 rounded-full border border-outline-variant/20">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Counter badges */}
        <div className="flex justify-center gap-8 mt-16 flex-wrap reveal-up">
          {[
            { label: 'Milestones', value: TIMELINE_EVENTS.filter(e => e.type === 'milestone').length, icon: 'star' },
            { label: 'Memories', value: TIMELINE_EVENTS.filter(e => e.type === 'memory').length, icon: 'photo_camera' },
            { label: 'Upcoming', value: TIMELINE_EVENTS.filter(e => e.type === 'upcoming').length, icon: 'schedule' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center gap-3 bg-surface-container-lowest rounded-2xl px-6 py-4 shadow-ambient">
              <span className="material-symbols-outlined text-primary">{icon}</span>
              <div>
                <div className="font-headline text-2xl text-primary">{value}</div>
                <div className="text-[9px] uppercase tracking-widest text-on-surface-variant/60">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
