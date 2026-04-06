'use client'

import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { FRIENDS_BIRTHDAYS, getAgeOnBirthday, getDaysUntilBirthday } from '@/lib/birthdays'

const DISMISS_KEY = 'itp-birthday-banner-dismissed'

export default function BirthdayBanner() {
  const [dismissed, setDismissed] = useState(false)

  const { todayBirthdays, upcomingBirthdays } = useMemo(() => {
    const today = FRIENDS_BIRTHDAYS.filter((friend) => getDaysUntilBirthday(friend) === 0)
    const upcoming = FRIENDS_BIRTHDAYS
      .map((friend) => ({ ...friend, daysUntil: getDaysUntilBirthday(friend) }))
      .filter((friend) => friend.daysUntil > 0 && friend.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil)

    return { todayBirthdays: today, upcomingBirthdays: upcoming }
  }, [])

  useEffect(() => {
    const hidden = sessionStorage.getItem(DISMISS_KEY)
    setDismissed(hidden === '1')
  }, [])

  useEffect(() => {
    if (dismissed || todayBirthdays.length === 0) return

    const burst = () => {
      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.25 },
      })
    }

    burst()
    const timeout = window.setTimeout(() => {
      confetti({ particleCount: 80, spread: 100, origin: { x: 0.15, y: 0.25 } })
      confetti({ particleCount: 80, spread: 100, origin: { x: 0.85, y: 0.25 } })
    }, 450)

    return () => window.clearTimeout(timeout)
  }, [dismissed, todayBirthdays.length])

  if (dismissed || (todayBirthdays.length === 0 && upcomingBirthdays.length === 0)) {
    return null
  }

  return (
    <div className="mb-6 space-y-3">
      {todayBirthdays.map((friend) => (
        <div
          key={`today-${friend.name}`}
          className="relative overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 p-5 text-white shadow-xl shadow-rose-500/20"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-full animate-pulse bg-white/5" />

          <div className="relative flex items-center justify-between gap-3">
            <p className="font-headline text-xl md:text-3xl italic leading-tight">
              <span className="text-3xl md:text-4xl mr-2">🎂</span>
              Happy Birthday {friend.name}! <span className="text-3xl md:text-4xl ml-2">🎉</span>
              <span className="block text-base md:text-lg not-italic font-label font-semibold mt-1">
                Turn {getAgeOnBirthday(friend)} today!
              </span>
            </p>
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem(DISMISS_KEY, '1')
                setDismissed(true)
              }}
              className="shrink-0 rounded-full border border-white/50 bg-white/20 px-3 py-1 text-[10px] uppercase tracking-widest font-bold hover:bg-white/30"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}

      {upcomingBirthdays.length > 0 && (
        <div className="space-y-2">
          {upcomingBirthdays.map((friend) => (
            <div
              key={`upcoming-${friend.name}`}
              className="rounded-2xl border border-primary/15 bg-surface-container p-4 text-on-surface shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm md:text-base font-medium">
                  <span className="mr-2 text-lg">🎁</span>
                  {friend.name}&apos;s birthday is in <span className="font-bold">{friend.daysUntil}</span>{' '}
                  {friend.daysUntil === 1 ? 'day' : 'days'}!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem(DISMISS_KEY, '1')
                    setDismissed(true)
                  }}
                  className="shrink-0 rounded-full border border-outline-variant/30 px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant hover:text-primary hover:border-primary"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
