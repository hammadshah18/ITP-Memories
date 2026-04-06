'use client'

import { useEffect, useRef } from 'react'
import { FRIENDS } from '@/lib/data'
import { Memory } from '@/types'

interface FriendsSectionProps {
  memories: Memory[]
}

export default function FriendsSection({ memories }: FriendsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

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

  const countByFriend = (name: string) =>
    memories.filter(m => m.uploadedBy === name).length

  const gradients = [
    'from-[#486648] to-[#9ebf9c]',
    'from-[#4c644e] to-[#ceeacd]',
    'from-[#556257] to-[#d8e6d8]',
    'from-[#304d32] to-[#c9ecc6]',
  ]

  const friendImages = ['/images/pic1.jpg', '/images/pic2.jpg', '/images/pic3.jpg', '/images/pic4.jpeg']

  return (
    <section id="friends" ref={sectionRef} className="py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-20 reveal-up">
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary/60 font-bold mb-4">
            The Four of Us
          </p>
          <h2 className="font-headline text-6xl lg:text-7xl italic text-on-surface leading-tight">
            The Souls
            <br />
            <span className="gradient-text">Behind Every Frame</span>
          </h2>
        </div>

        {/* Friend cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FRIENDS.map((friend, i) => {
            const count = countByFriend(friend.name)
            const isEven = i % 2 === 0
            return (
              <div
                key={friend.id}
                className={`flex flex-col items-center text-center ${isEven ? 'reveal-up' : 'reveal-up'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Avatar with rotating gradient border */}
                <div className="relative mb-6 group">
                  {/* Spinning gradient ring */}
                  <div
                    className="absolute inset-[-4px] rounded-full animate-spin-slow opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `conic-gradient(from 0deg, #c9ecc6, #486648, #9ebf9c, #c9ecc6)`,
                      borderRadius: '50%',
                    }}
                  />
                  {/* White gap ring */}
                  <div className="absolute inset-[-2px] rounded-full bg-surface" />
                  {/* Avatar */}
                  <div
                    className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${gradients[i]} flex items-center justify-center shadow-ambient-md`}
                  >
                    <img
                      src={friendImages[i]}
                      alt={friend.name}
                      className="w-full h-full rounded-full object-cover object-center"
                    />
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-headline text-xl italic text-on-surface mb-1">
                  {friend.name}
                </h3>

                {/* Memory count badge */}
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="material-symbols-outlined text-primary text-sm">photo_library</span>
                  <span className="text-xs font-bold text-primary">{count}</span>
                  <span className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                    {count === 1 ? 'memory' : 'memories'}
                  </span>
                </div>

                {/* Quote */}
                <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed italic max-w-xs w-full">
                  &ldquo;{friend.quote}&rdquo;
                </p>
              </div>
            )
          })}
        </div>

        {/* Together since banner */}
        <div className="mt-20 bg-gradient-to-br from-primary-fixed/40 to-secondary-container/30 rounded-3xl p-10 text-center reveal-up">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-bold mb-2">Together since</p>
          <h3 className="font-headline text-4xl italic text-primary mb-3">August 15, 2023</h3>
          <p className="text-on-surface-variant/70 text-sm max-w-sm mx-auto">
            Four people. One journey. Countless moments that will never be forgotten.
          </p>
        </div>
      </div>
    </section>
  )
}
