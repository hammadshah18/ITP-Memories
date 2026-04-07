'use client'

import { Memory } from '@/types'
import { FRIENDS } from '@/lib/data'

interface FriendsSectionProps {
  memories: Memory[]
}

export default function FriendsSection({ memories }: FriendsSectionProps) {
  return (
    <section id="friends" className="space-y-2 py-3">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Friends</p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {FRIENDS.map((friend) => {
          const count = memories.filter((memory) => memory.uploadedBy === friend.name).length
          const initials = friend.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
          return (
            <article key={friend.id} className="min-w-[112px] rounded-xl border border-outline-variant/20 bg-surface-container-low p-3 text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-primary-fixed text-primary text-xs font-semibold flex items-center justify-center">{initials}</div>
              <p className="mt-2 text-[12px] text-on-surface line-clamp-1">{friend.name}</p>
              <p className="text-[11px] text-on-surface-variant">{count} memories</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
