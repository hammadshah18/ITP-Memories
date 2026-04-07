'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import BirthdayBanner from '@/components/BirthdayBanner'
import Hero from '@/components/Hero'

const TEAM_MEMBERS = [
  {
    name: 'Hammad Shah',
    image: '/images/hammadshah.jpeg',
    caption: 'Memories curator and timeline keeper.',
  },
  {
    name: 'Raza Khan',
    image: '/images/Raza khan.jpeg',
    caption: 'Captures moments that define our friendship.',
  },
  {
    name: 'Aitzaz Hassan',
    image: '/images/Aitzaz hassan.jpeg',
    caption: 'Keeps every chapter meaningful and connected.',
  },
  {
    name: 'Hammad Masood',
    image: '/images/hammad masood.jpeg',
    caption: 'Builds and preserves the shared archive.',
  },
]

export default function Home() {
  const router = useRouter()
  const memories = useMemo(() => [], [])
  const { authUser } = useAuthSession()

  return (
    <main className="space-y-4 py-3">
      <Hero memories={memories} onExplore={() => router.push(authUser ? '/dashboard' : '/login')} />

      <BirthdayBanner />

      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">About ITP Memories</p>
        <h2 className="mt-1 text-[18px] font-semibold text-on-surface">A private memory archive for our circle</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          This app is a secure journal of moments shared by our team. Public visitors can view the intro,
          while personal memories stay protected behind admin access.
        </p>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Our Team</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TEAM_MEMBERS.map((member) => (
            <article key={member.name} className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-surface-container-high">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 text-[14px] font-medium text-on-surface">{member.name}</p>
              <p className="text-[12px] text-on-surface-variant">{member.caption}</p>
            </article>
          ))}
        </div>
      </section>

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
