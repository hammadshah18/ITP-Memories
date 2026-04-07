'use client'

import { TIMELINE_EVENTS } from '@/lib/data'
import { formatDateShort } from '@/lib/utils'

export default function TimelineSection() {
  const groupedByYear = TIMELINE_EVENTS.reduce<Record<string, typeof TIMELINE_EVENTS>>((acc, event) => {
    const year = new Date(event.date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(event)
    return acc
  }, {})

  const years = Object.keys(groupedByYear).sort((a, b) => Number(a) - Number(b))

  return (
    <section id="timeline" className="space-y-3 py-3">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Timeline</p>
      {years.map((year) => (
        <div key={year} className="space-y-2">
          <p className="text-[11px] font-semibold text-on-surface-variant">{year}</p>
          <div className="space-y-2">
            {groupedByYear[year].map((event) => (
              <article key={event.id} className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
                <p className="text-[11px] text-on-surface-variant">{formatDateShort(event.date)}</p>
                <h3 className="mt-1 text-[14px] font-medium text-on-surface">{event.title}</h3>
                <p className="mt-1 text-[12px] text-on-surface-variant">{event.description}</p>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
