'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_SYMBOLS = ['✦', '✧', '◦', '·', '❋', '✿', '⊹', '✺']

export default function Particles() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles: HTMLSpanElement[] = []

    for (let i = 0; i < 18; i++) {
      const p = document.createElement('span')
      p.className = 'particle'
      p.textContent = PARTICLE_SYMBOLS[i % PARTICLE_SYMBOLS.length]
      p.style.left = `${Math.random() * 100}%`
      p.style.animationDuration = `${6 + Math.random() * 10}s`
      p.style.animationDelay = `${Math.random() * 8}s`
      p.style.fontSize = `${8 + Math.random() * 10}px`
      p.style.opacity = '0'
      container.appendChild(p)
      particles.push(p)
    }

    return () => particles.forEach(p => p.remove())
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  )
}
