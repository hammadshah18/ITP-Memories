'use client'

import { useEffect, useMemo, useState } from 'react'
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

  if (dismissed || (todayBirthdays.length === 0 && upcomingBirthdays.length === 0)) {
    return null
  }

  return (
    <div className="space-y-2">
      {todayBirthdays.map((friend) => (
        <div
          key={`today-${friend.name}`}
          className="h-12 rounded-xl border border-primary/20 bg-primary-fixed/35 px-3 flex items-center justify-between"
        >
          <p className="truncate text-[12px] text-on-surface">
            🎂 Happy Birthday {friend.name}! Turns {getAgeOnBirthday(friend)} today.
          </p>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem(DISMISS_KEY, '1')
              setDismissed(true)
            }}
            className="ml-2 rounded-full bg-surface px-2.5 py-1 text-[10px] text-on-surface-variant"
          >
            Dismiss
          </button>
        </div>
      ))}

      {upcomingBirthdays.length > 0 && (
        <div className="space-y-2">
          {upcomingBirthdays.map((friend) => (
            <div
              key={`upcoming-${friend.name}`}
              className="h-12 rounded-xl border border-outline-variant/25 bg-surface-container px-3 flex items-center justify-between"
            >
              <p className="truncate text-[12px] text-on-surface-variant">
                🎁 {friend.name}&apos;s birthday in {friend.daysUntil} {friend.daysUntil === 1 ? 'day' : 'days'}.
              </p>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem(DISMISS_KEY, '1')
                  setDismissed(true)
                }}
                className="ml-2 rounded-full bg-surface px-2.5 py-1 text-[10px] text-on-surface-variant"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
