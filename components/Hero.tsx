'use client'

import { useEffect, useRef } from 'react'
import { daysSince } from '@/lib/utils'
import { Memory } from '@/types'
import { motion } from 'framer-motion'

interface HeroProps {
  memories: Memory[]
  onExplore: () => void
}

const ORBIT_IMAGES = [
  { delay: '0s', duration: '20s', radius: 150, size: 64 },
  { delay: '-5s', duration: '25s', radius: 150, size: 56 },
  { delay: '-10s', duration: '20s', radius: 150, size: 60 },
  { delay: '-15s', duration: '25s', radius: 150, size: 52 },
  { delay: '-3s', duration: '30s', radius: 200, size: 48 },
  { delay: '-8s', duration: '30s', radius: 200, size: 56 },
]

const GRADIENT_PAIRS = [
  ['#c9ecc6', '#9ebf9c'],
  ['#ceeacd', '#b3ceb2'],
  ['#d8e6d8', '#acbaad'],
  ['#9ebf9c', '#486648'],
  ['#c9ecc6', '#4c644e'],
  ['#bccabd', '#556257'],
]

const INITIALS = ['HM', 'RK', 'HS', 'AH', 'HM', 'RK']
const HERO_IMAGES = [
  '/images/pic1.jpg',
  '/images/pic2.jpg',
  '/images/pic3.jpg',
  '/images/pic4.jpeg',
  '/images/pic6.jpeg',
  '/images/pic7.jpeg',
]

export default function Hero({ memories, onExplore }: HeroProps) {
  const days = daysSince('2023-08-15')
  const orbitRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Subtle parallax on mouse move
    const handleMouse = (e: MouseEvent) => {
      if (!orbitRef.current) return
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx
      const dy = (e.clientY - cy) / cy
      orbitRef.current.style.transform = `translate(${dx * 12}px, ${dy * 8}px)`
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
    >
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary-fixed/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-secondary-fixed/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] left-[10%] w-[20vw] h-[20vw] bg-tertiary-fixed/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-16 max-w-7xl mx-auto px-8 w-full">

        {/* Left: Text */}
        <motion.div
          className="flex-1 text-center lg:text-left max-w-lg"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70 font-bold mb-6">
            August 15, 2023 — Forever
          </p>
          <h1 className="font-headline text-6xl lg:text-7xl xl:text-8xl leading-[0.9] text-on-surface mb-4">
            Our Journey
            <br />
            <span className="italic gradient-text">Since</span>
          </h1>
          <h2 className="font-headline text-4xl lg:text-5xl text-primary italic mb-8">
            August 15, 2023
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed mb-4 max-w-md mx-auto lg:mx-0">
            A curated vessel for sentiment. Memories, moments, and the quiet beauty of a friendship that blooms with every passing season.
          </p>

          {/* Stats */}
          <div className="flex gap-8 justify-center lg:justify-start mb-10">
            <div>
              <div className="font-headline text-3xl text-primary">{days}</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">Days Together</div>
            </div>
            <div>
              <div className="font-headline text-3xl text-primary">{memories.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">Memories</div>
            </div>
            <div>
              <div className="font-headline text-3xl text-primary">4</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">Friends</div>
            </div>
          </div>

          <button
            onClick={onExplore}
            className="
              inline-flex items-center gap-3
              bg-gradient-to-br from-primary to-primary-container
              text-on-primary font-label text-xs font-bold uppercase tracking-[0.15em]
              px-10 py-4 rounded-full
              transition-all duration-300 active:scale-95
              shadow-lg shadow-primary/25 hover:shadow-primary/50 hover:scale-105
              glow-primary
            "
          >
            <span className="material-symbols-outlined text-lg">explore</span>
            Explore Archive
          </button>
        </motion.div>

        {/* Right: Orbit System */}
        <motion.div
          className="flex-shrink-0 relative"
          style={{ width: 420, height: 420 }}
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div ref={orbitRef} className="transition-transform duration-500 ease-out w-full h-full relative">

            {/* Orbit rings */}
            <div className="absolute inset-[60px] border border-dashed border-primary-fixed/40 rounded-full" />
            <div className="absolute inset-[20px] border border-dashed border-primary-fixed/20 rounded-full" />

            {/* Center circle — main image */}
            <div className="absolute inset-[90px] rounded-full overflow-hidden shadow-[0_20px_60px_rgba(72,102,72,0.25)] border-4 border-white/80">
              <img
                src="/images/pic5.jpeg"
                alt="Our journey since August 15, 2023"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Orbiting items */}
            {ORBIT_IMAGES.map((item, i) => {
              const angle = (i / ORBIT_IMAGES.length) * 360
              const rad = (angle * Math.PI) / 180
              const cx = 210
              const cy = 210
              const x = cx + item.radius * Math.cos(rad) - item.size / 2
              const y = cy + item.radius * Math.sin(rad) - item.size / 2
              const [c1, c2] = GRADIENT_PAIRS[i]

              return (
                <div
                  key={i}
                  className="absolute rounded-full overflow-hidden border-2 border-white shadow-ambient-md"
                  style={{
                    left: x,
                    top: y,
                    width: item.size,
                    height: item.size,
                    animation: `orbit ${item.duration} linear ${item.delay} infinite`,
                    transformOrigin: `${210 - x - item.size / 2}px ${210 - y - item.size / 2}px`,
                  }}
                >
                  <div className="w-full h-full relative">
                    <img
                      src={HERO_IMAGES[i]}
                      alt={`Friend memory ${i + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-on-primary"
                      style={{ background: `linear-gradient(135deg, ${c1}88, ${c2}66)` }}
                    >
                      {INITIALS[i]}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Scroll hint */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-[9px] uppercase tracking-widest text-on-surface/30">Scroll to Journey</span>
            <div className="w-px h-8 bg-gradient-to-b from-primary-fixed to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
