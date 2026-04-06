'use client'

import { FRIENDS_BIRTHDAYS, getDaysUntilBirthday, getNextBirthdayDate } from '@/lib/birthdays'

export default function BirthdayCalendarWidget() {
  const rows = FRIENDS_BIRTHDAYS
    .map((friend) => ({
      ...friend,
      daysUntil: getDaysUntilBirthday(friend),
      nextBirthday: getNextBirthdayDate(friend),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)

  return (
    <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6 shadow-ambient">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📅</span>
        <h2 className="font-headline italic text-2xl text-on-surface">Birthday Calendar</h2>
      </div>

      <ul className="space-y-3">
        {rows.map((friend) => (
          <li key={friend.name} className="rounded-2xl bg-surface-container px-4 py-3 border border-outline-variant/10">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-on-surface">{friend.name}</p>
                <p className="text-xs text-on-surface-variant/70">
                  {friend.day} {friend.nextBirthday.toLocaleDateString('en-US', { month: 'long' })} {friend.year}
                </p>
              </div>

              <p className="text-xs font-bold text-primary bg-primary-fixed/50 px-3 py-1 rounded-full">
                {friend.daysUntil === 0 ? 'Today' : `${friend.daysUntil} day${friend.daysUntil === 1 ? '' : 's'}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
