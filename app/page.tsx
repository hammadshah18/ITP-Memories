'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import BirthdayBanner from '@/components/BirthdayBanner'
import Hero from '@/components/Hero'

export default function Home() {
  const router = useRouter()
  const memories = useMemo(() => [], [])
  const { authUser } = useAuthSession()

  return (
    <main className="space-y-4 py-3">
      <Hero memories={memories} onExplore={() => router.push(authUser ? '/dashboard' : '/login')} />

      <BirthdayBanner />

      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Private Access</p>
        <p className="mt-1 text-sm text-on-surface">Memories and photos are available after admin login.</p>
        <button
          type="button"
          onClick={() => router.push(authUser ? '/dashboard' : '/login')}
          className="mt-3 h-9 rounded-full px-4 bg-primary text-on-primary text-xs font-semibold transition-opacity duration-150 hover:opacity-90"
        >
          {authUser ? 'Go to Dashboard' : 'Admin Login'}
        </button>
      </section>

      <p className="py-2 text-center text-[10px] uppercase tracking-widest text-on-surface-variant/70">ITP Memories v1.0</p>
    </main>
  )
}
