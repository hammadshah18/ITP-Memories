'use client'

import { useEffect, useRef } from 'react'
import { Memory } from '@/types'

interface MemoryWallProps {
  memories: Memory[]
  onMemoryClick: (memory: Memory) => void
}

const GRADIENT_COLORS = [
  'from-primary-fixed to-secondary-container',
  'from-secondary-fixed to-tertiary-fixed',
  'from-tertiary-fixed to-primary-fixed',
  'from-primary-container to-secondary-container',
  'from-secondary-container to-primary-fixed',
  'from-primary-fixed to-tertiary-fixed',
]

export default function MemoryWall({ memories, onMemoryClick }: MemoryWallProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const filmRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('revealed')
      }),
      { threshold: 0.05 }
    )
    sectionRef.current?.querySelectorAll('.reveal-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Duplicate for seamless loop
  const filmMemories = [...memories, ...memories]

  // Distribute into 3 columns for masonry
  const cols: Memory[][] = [[], [], []]
  memories.forEach((m, i) => cols[i % 3].push(m))

  return (
    <section ref={sectionRef} className="py-20 overflow-hidden">

      {/* ─── Film Reel Strip ─── */}
      <div className="mb-20 relative">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden py-2">
          <div ref={filmRef} className="film-reel">
            {filmMemories.map((memory, i) => (
              <div
                key={`${memory.id}-${i}`}
                onClick={() => onMemoryClick(memory)}
                className="flex-shrink-0 w-48 h-36 rounded-2xl overflow-hidden cursor-pointer relative group shadow-ambient hover:shadow-ambient-md transition-all duration-300 hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]}`} />
                <img
                  src={memory.imagePath}
                  alt={memory.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0'
                  }}
                />
                <div className="absolute inset-0 bg-on-surface/0 group-hover:bg-on-surface/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-on-surface/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest truncate">{memory.title}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <span className="material-symbols-outlined text-4xl text-white">image</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Masonry Wall Header ─── */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-end justify-between mb-12 reveal-up">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-primary/60 font-bold mb-3">All Memories</p>
            <h2 className="font-headline text-5xl lg:text-6xl italic text-on-surface">
              The Wall of
              <br />
              <span className="gradient-text">Us</span>
            </h2>
          </div>
          <div className="text-right">
            <p className="font-headline text-4xl text-primary">{memories.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">Moments Preserved</p>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 reveal-up">
          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-5">
              {col.map((memory, mi) => {
                const heights = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/5]']
                const height = heights[(ci + mi) % heights.length]
                return (
                  <div
                    key={memory.id}
                    onClick={() => onMemoryClick(memory)}
                    className={`
                      ${height} rounded-2xl overflow-hidden relative group cursor-pointer
                      shadow-ambient hover:shadow-ambient-md transition-all duration-500
                      hover:scale-[1.02]
                    `}
                  >
                    {/* Gradient bg */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_COLORS[(ci + mi) % GRADIENT_COLORS.length]}`} />
                    <img
                      src={memory.imagePath}
                      alt={memory.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0'
                      }}
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-on-surface/0 group-hover:bg-on-surface/15 transition-colors duration-300" />

                    {/* Image placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <span className="material-symbols-outlined text-5xl text-white">image</span>
                    </div>

                    {/* Info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-on-surface/70 via-on-surface/30 to-transparent p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white font-headline italic text-lg leading-tight">{memory.title}</p>
                      <p className="text-white/70 text-[10px] uppercase tracking-widest mt-1">{memory.uploadedBy.split(' ')[0]}</p>
                    </div>

                    {/* Series tag */}
                    {memory.series && (
                      <div className="absolute top-3 left-3 bg-white/80 glass rounded-full px-3 py-1">
                        <span className="text-[9px] uppercase tracking-widest text-primary font-bold">{memory.series}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
