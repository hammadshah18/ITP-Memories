'use client'

import { useEffect, useRef, useState } from 'react'
import { Memory } from '@/types'
import MemoryCard from './MemoryCard'
import { getMemoriesByYear } from '@/lib/utils'

interface MemoriesSectionProps {
  memories: Memory[]
  onMemoryClick: (memory: Memory) => void
}

export default function MemoriesSection({ memories, onMemoryClick }: MemoriesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    const elements = sectionRef.current?.querySelectorAll('.reveal-left, .reveal-right, .reveal-up')
    elements?.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [memories])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)))
      setScrollProgress(progress)

      // Rotate images on scroll
      const images = sectionRef.current.querySelectorAll<HTMLElement>('.scroll-rotate')
      images.forEach((img, i) => {
        const dir = i % 2 === 0 ? 1 : -1
        const rotation = progress * 25 * dir
        img.style.transform = `rotate(${rotation}deg)`
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const byYear = getMemoriesByYear(memories)
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  const jumpToYear = (year: string) => {
    document.getElementById(`year-${year}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="memories" ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-[5%] top-[20%] w-[25vw] h-[25vw] bg-primary-fixed/15 rounded-full blur-[100px] transition-transform duration-100"
          style={{ transform: `translateY(${scrollProgress * 60}px)` }}
        />
        <div
          className="absolute right-[5%] bottom-[20%] w-[20vw] h-[20vw] bg-secondary-fixed/15 rounded-full blur-[80px] transition-transform duration-100"
          style={{ transform: `translateY(${-scrollProgress * 40}px)` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-24 reveal-up">
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary/60 font-bold mb-4">
            Our Story
          </p>
          <h2 className="font-headline text-6xl lg:text-7xl italic text-on-surface leading-tight">
            Moments that
            <br />
            <span className="gradient-text">Define Us</span>
          </h2>
        </div>

        {years.length > 0 && (
          <div className="sticky top-24 z-30 mb-12 reveal-up">
            <div className="mx-auto w-fit flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/80 glass border border-primary-fixed/50 px-3 py-2 shadow-ambient">
              {years.map((year) => (
                <button
                  key={`jump-${year}`}
                  onClick={() => jumpToYear(year)}
                  className="text-[10px] uppercase tracking-widest font-bold px-3 py-2 rounded-full bg-surface-container hover:bg-primary-fixed/60 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year groups */}
        {years.map((year) => (
          <div id={`year-${year}`} key={year} className="mb-32 scroll-mt-32">
            {/* Year label */}
            <div className="flex items-center gap-6 mb-16 reveal-up">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary-fixed/60" />
              <span className="font-headline text-8xl text-primary-fixed/40 font-bold select-none">
                {year}
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary-fixed/60" />
            </div>

            {/* Cards */}
            <div className="space-y-24">
              {byYear[year].map((memory, i) => (
                <div
                  key={memory.id}
                  className={i % 2 === 0 ? 'reveal-left' : 'reveal-right'}
                >
                  <MemoryCard
                    memory={memory}
                    onClick={onMemoryClick}
                    align={i % 2 === 0 ? 'left' : 'right'}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {memories.length === 0 && (
          <div className="text-center py-24 reveal-up">
            <span className="material-symbols-outlined text-6xl text-primary-fixed/60 mb-4 block">photo_library</span>
            <p className="font-headline text-2xl italic text-on-surface-variant">
              The first memory is waiting to be made.
            </p>
            <p className="text-sm text-on-surface-variant/60 mt-2">
              Click &quot;Add New&quot; to preserve your first moment.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
