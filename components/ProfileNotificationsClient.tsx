'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MOCK_NOTIFICATIONS } from '@/lib/appContent'

const STORAGE_KEY = 'itp-notifications-enabled'

export default function ProfileNotificationsClient() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === '0') {
      setEnabled(false)
    }
  }, [])

  const toggleNotifications = () => {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  }

  return (
    <main className="space-y-3 py-3">
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
        <Link
          href="/dashboard/profile"
          className="inline-flex h-9 items-center gap-1 rounded-full border border-outline-variant/30 px-3 text-xs text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        <h1 className="mt-3 text-[18px] font-semibold text-on-surface">Notifications</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Choose if activity notifications should appear in the app.</p>

        <button
          type="button"
          onClick={toggleNotifications}
          className="mt-3 flex h-10 items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-4 text-sm text-on-surface transition-colors hover:border-primary/40"
        >
          <span
            className={`h-5 w-9 rounded-full p-0.5 transition-colors ${enabled ? 'bg-primary' : 'bg-surface-container-high'}`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </span>
          {enabled ? 'Enabled' : 'Disabled'}
        </button>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Recent Activity</p>
        <div className="space-y-2">
          {MOCK_NOTIFICATIONS.map((item) => (
            <article key={item.id} className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-on-surface">{item.text}</p>
                {item.unread ? <span className="mt-1 h-2 w-2 rounded-full bg-primary" /> : null}
              </div>
              <p className="mt-1 text-[11px] text-on-surface-variant">{item.time}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
