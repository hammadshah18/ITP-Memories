'use client'

import { UPCOMING_EVENTS } from '@/lib/data'

export default function UpcomingSection() {
  return (
    <section id="upcoming" className="space-y-2 py-3">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Upcoming</p>
      <div className="space-y-2">
        {UPCOMING_EVENTS.map((event) => (
          <article key={event.id} className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
            <p className="text-[11px] text-on-surface-variant">{event.status}</p>
            <h3 className="mt-1 text-[14px] font-medium text-on-surface">{event.title}</h3>
            <p className="mt-1 text-[12px] text-on-surface-variant">{event.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
