'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import MusicToggle from './MusicToggle'

interface NavBarProps {
  onAddMemory: () => void
  onAuthClick: () => void
  onLogout: () => void
  isAuthenticated: boolean
  userEmail: string | null
  activeSection: string
  showAddButton?: boolean
}

export default function NavBar({
  onAddMemory,
  onAuthClick,
  onLogout,
  isAuthenticated,
  userEmail,
  activeSection,
  showAddButton = true,
}: NavBarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500',
        'w-[90%] max-w-6xl rounded-full px-8 py-3',
        'flex justify-between items-center',
        'glass shadow-ambient',
        scrolled
          ? 'bg-white/80 shadow-[0_8px_32px_rgba(25,28,27,0.08)]'
          : 'bg-white/70 shadow-[0_40px_60px_-5px_rgba(25,28,27,0.05)]'
      )}
    >
      {/* Logo */}
      <button
        onClick={() => scrollTo('hero')}
        className="text-2xl font-headline text-primary tracking-tighter italic select-none"
      >
        Memory Timeline
      </button>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {[
          { label: 'Memories', id: 'memories' },
          { label: 'Timeline', id: 'timeline' },
          { label: 'Friends', id: 'friends' },
          { label: 'Upcoming', id: 'upcoming' },
        ].map(({ label, id }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={cn(
              'text-sm font-medium transition-all duration-300 px-3 py-1 rounded-full',
              activeSection === id
                ? 'text-primary bg-primary-fixed/50'
                : 'text-on-surface/50 hover:text-primary hover:bg-primary-fixed/30'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 border-l border-outline-variant/20 pl-6">
        <MusicToggle />
        {isAuthenticated ? (
          <>
            <button
              onClick={onAuthClick}
              className="px-4 py-2 rounded-full border border-outline-variant/40 text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
              title={userEmail ?? 'Authenticated user'}
            >
              Dashboard
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-full border border-outline-variant/40 text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={onAuthClick}
            className="px-4 py-2 rounded-full border border-outline-variant/40 text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            Admin Login
          </button>
        )}
        {showAddButton && (
          <button
            onClick={onAddMemory}
            className="
              bg-gradient-to-br from-primary to-primary-container
              text-on-primary px-6 py-2 rounded-full
              font-label text-xs font-bold uppercase tracking-widest
              transition-all duration-300 active:scale-95
              shadow-lg shadow-primary/20
              hover:shadow-primary/40 hover:scale-105
            "
          >
            Add New
          </button>
        )}

        {/* Friends avatars */}
        <div className="flex -space-x-2">
          {['HM', 'RK', 'HS', 'AH'].map((initials, i) => (
            <div
              key={initials}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-[9px] font-bold border-2 border-white"
              style={{ zIndex: 4 - i }}
              title={['hammad Masood', 'Raza Khan', 'Hammad Shah', 'Aitzaz Hasan'][i]}
            >
              {initials}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
