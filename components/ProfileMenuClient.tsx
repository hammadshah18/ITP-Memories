'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, ChevronRight, Info, LogOut } from 'lucide-react'

interface ProfileMenuClientProps {
  email: string
}

function initials(email: string) {
  const [name] = email.split('@')
  return name.slice(0, 2).toUpperCase()
}

export default function ProfileMenuClient({ email }: ProfileMenuClientProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })

      if (typeof window !== 'undefined') {
        localStorage.removeItem('itp-auth-user')
        localStorage.removeItem('supabase.auth.token')
        Object.keys(localStorage).forEach((key) => {
          if (key.toLowerCase().includes('session') || key.toLowerCase().includes('auth')) {
            localStorage.removeItem(key)
          }
        })
      }

      router.push('/')
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="space-y-3 py-3">
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-on-primary">
          {initials(email)}
        </div>
        <p className="mt-2 text-[16px] font-medium text-on-surface">{email.split('@')[0]}</p>
        <p className="text-[12px] text-on-surface-variant">{email}</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low">
        <Link
          href="/dashboard/profile/notifications"
          className="flex h-12 items-center justify-between border-b border-outline-variant/20 px-3 transition-colors duration-150 hover:bg-surface-container"
        >
          <div className="flex items-center gap-2 text-on-surface">
            <Bell size={16} />
            <span className="text-sm">Notifications</span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="text-[12px]">Manage</span>
            <ChevronRight size={14} />
          </div>
        </Link>

        <Link
          href="/dashboard/profile/about"
          className="flex h-12 items-center justify-between border-b border-outline-variant/20 px-3 transition-colors duration-150 hover:bg-surface-container"
        >
          <div className="flex items-center gap-2 text-on-surface">
            <Info size={16} />
            <span className="text-sm">About</span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="text-[12px]">ITP Memories v1.0.0</span>
            <ChevronRight size={14} />
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-12 w-full items-center justify-between px-3 text-left transition-colors duration-150 hover:bg-surface-container"
        >
          <div className="flex items-center gap-2 text-on-surface">
            <LogOut size={16} />
            <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </div>
          <ChevronRight size={14} className="text-on-surface-variant" />
        </button>
      </section>
    </main>
  )
}
