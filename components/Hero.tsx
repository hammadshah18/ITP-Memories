'use client'

import { Bell } from 'lucide-react'
import { Memory } from '@/types'
import { useAuthSession } from '@/hooks/useAuthSession'

interface HeroProps {
  memories: Memory[]
  onExplore: () => void
}

function getInitials(email?: string | null) {
  if (!email) return 'IT'
  const [name] = email.split('@')
  return name.slice(0, 2).toUpperCase()
}

export default function Hero({ memories }: HeroProps) {
  const { authUser } = useAuthSession()

  return (
    <section id="hero" className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
      <div className="h-[56px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/icons/icon-192x192.png"
            alt="ITP Memories"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div>
            <p className="text-sm text-on-surface font-medium">ITP Memories</p>
            <p className="text-[11px] text-on-surface-variant">Private archive • {memories.length} public items</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-surface px-2 py-1">
            <div className="h-6 w-6 rounded-full bg-primary-fixed text-primary text-[10px] font-semibold flex items-center justify-center">
              {getInitials(authUser?.email)}
            </div>
            <span className="max-w-[92px] truncate text-[11px] text-on-surface-variant">{authUser?.email ?? 'Guest'}</span>
          </div>
          <button className="h-8 w-8 rounded-full bg-surface text-on-surface-variant flex items-center justify-center" aria-label="Notifications">
            <Bell size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
