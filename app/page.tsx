'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Memory } from '@/types'
import { INITIAL_MEMORIES } from '@/lib/data'
import { useAuthSession } from '@/hooks/useAuthSession'

import NavBar from '@/components/NavBar'
import SideBar from '@/components/SideBar'
import Hero from '@/components/Hero'
import MemoriesSection from '@/components/MemoriesSection'
import MemoryWall from '@/components/MemoryWall'
import TimelineSection from '@/components/TimelineSection'
import FriendsSection from '@/components/FriendsSection'
import UpcomingSection from '@/components/UpcomingSection'
import Footer from '@/components/Footer'
import MemoryDetail from '@/components/MemoryDetail'
import Particles from '@/components/Particles'
import ThisDay from '@/components/ThisDay'
import BirthdayBanner from '@/components/BirthdayBanner'

export default function Home() {
  const router = useRouter()
  const memories = INITIAL_MEMORIES
  const { authUser, setAuthUser } = useAuthSession()
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [activeSection, setActiveSection] = useState('hero')

  // Track active section on scroll
  useEffect(() => {
    const sections = ['hero', 'memories', 'timeline', 'friends', 'upcoming']
    const observers: IntersectionObserver[] = []

    sections.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { threshold: 0.4 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  const handleDashboardClick = useCallback(() => {
    if (!authUser) {
      router.push('/login')
      return
    }

    router.push('/dashboard')
  }, [authUser, router])

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAuthUser(null)
  }, [setAuthUser])

  const handleMemoryClick = useCallback((memory: Memory) => {
    setSelectedMemory(memory)
  }, [])

  const handlePrev = useCallback(() => {
    if (!selectedMemory) return
    const idx = memories.indexOf(selectedMemory)
    if (idx > 0) setSelectedMemory(memories[idx - 1])
  }, [selectedMemory, memories])

  const handleNext = useCallback(() => {
    if (!selectedMemory) return
    const idx = memories.indexOf(selectedMemory)
    if (idx < memories.length - 1) setSelectedMemory(memories[idx + 1])
  }, [selectedMemory, memories])

  return (
    <main className="relative bg-surface min-h-screen">
      {/* Global background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary-fixed/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-secondary-fixed/15 rounded-full blur-[100px]" />
      </div>

      {/* Floating particles */}
      <Particles />

      {/* Navigation */}
      <NavBar
        onAddMemory={handleDashboardClick}
        onAuthClick={handleDashboardClick}
        onLogout={handleLogout}
        isAuthenticated={Boolean(authUser)}
        userEmail={authUser?.email ?? null}
        activeSection={activeSection}
        showAddButton={false}
      />

      {/* Sidebar */}
      <SideBar activeSection={activeSection} />

      {/* Page sections */}
      <div className="relative z-10">
        <Hero memories={memories} onExplore={() => {
          document.getElementById('memories')?.scrollIntoView({ behavior: 'smooth' })
        }} />

        <section className="pt-6 px-8 max-w-6xl mx-auto">
          <BirthdayBanner />
        </section>

        <ThisDay memories={memories} onMemoryClick={handleMemoryClick} />

        <MemoriesSection memories={memories} onMemoryClick={handleMemoryClick} />

        <MemoryWall memories={memories} onMemoryClick={handleMemoryClick} />

        <TimelineSection />

        <FriendsSection memories={memories} />

        <UpcomingSection />

        <Footer />
      </div>

      <MemoryDetail
        memory={selectedMemory}
        memories={memories}
        onClose={() => setSelectedMemory(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </main>
  )
}
