'use client'

import { Memory } from '@/types'
import { formatDate } from '@/lib/utils'

interface ThisDayProps {
  memories: Memory[]
  onMemoryClick: (memory: Memory) => void
}

export default function ThisDay({ memories, onMemoryClick }: ThisDayProps) {
  const today = new Date()
  const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const todayMemories = memories.filter(m => {
    const d = new Date(m.date)
    const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return md === todayMD
  })

  if (todayMemories.length === 0) return null

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-8">
        <div className="bg-gradient-to-br from-primary-fixed/30 to-secondary-container/20 rounded-3xl p-10 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary-fixed/30 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">today</span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
                This Day in Our Journey
              </p>
            </div>

            <h3 className="font-headline text-3xl italic text-on-surface mb-8">
              On this day, {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}...
            </h3>

            <div className="flex gap-6 overflow-x-auto pb-2">
              {todayMemories.map(memory => (
                <div
                  key={memory.id}
                  onClick={() => onMemoryClick(memory)}
                  className="flex-shrink-0 cursor-pointer group"
                >
                  <div className="w-40 h-28 rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container mb-3 relative overflow-hidden shadow-ambient group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <span className="material-symbols-outlined text-3xl text-white">image</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-on-surface font-headline italic">{memory.title}</p>
                  <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-0.5">
                    {new Date(memory.date).getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
