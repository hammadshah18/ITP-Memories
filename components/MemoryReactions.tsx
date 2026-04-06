'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

type ReactionEmoji = '❤️' | '😂' | '😮' | '😢' | '🔥'

interface ReactionRow {
  id: string
  memory_id: string
  user_email: string
  emoji: ReactionEmoji
  created_at: string
}

interface MemoryReactionsProps {
  memoryId: string
  userEmail: string | null
}

const REACTIONS: ReactionEmoji[] = ['❤️', '😂', '😮', '😢', '🔥']

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export default function MemoryReactions({ memoryId, userEmail }: MemoryReactionsProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [rows, setRows] = useState<ReactionRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadReactions = useCallback(async () => {
    if (!isUuid(memoryId)) return

    const { data } = await supabase
      .from('memory_reactions')
      .select('id, memory_id, user_email, emoji, created_at')
      .eq('memory_id', memoryId)

    if (Array.isArray(data)) {
      setRows(data as ReactionRow[])
    }
  }, [memoryId, supabase])

  useEffect(() => {
    void loadReactions()
  }, [loadReactions])

  const counts = useMemo(() => {
    return REACTIONS.reduce<Record<ReactionEmoji, number>>((acc, emoji) => {
      acc[emoji] = rows.filter((row) => row.emoji === emoji).length
      return acc
    }, { '❤️': 0, '😂': 0, '😮': 0, '😢': 0, '🔥': 0 })
  }, [rows])

  const currentReaction = useMemo(() => {
    if (!userEmail) return null
    const found = rows.find((row) => row.user_email.toLowerCase() === userEmail.toLowerCase())
    return found?.emoji ?? null
  }, [rows, userEmail])

  const toggleReaction = async (emoji: ReactionEmoji) => {
    if (!userEmail || !isUuid(memoryId)) return

    setIsLoading(true)

    if (currentReaction === emoji) {
      await supabase
        .from('memory_reactions')
        .delete()
        .eq('memory_id', memoryId)
        .eq('user_email', userEmail)
    } else if (currentReaction) {
      await (supabase
        .from('memory_reactions') as any)
        .update({ emoji } as any)
        .eq('memory_id', memoryId)
        .eq('user_email', userEmail)
    } else {
      await supabase
        .from('memory_reactions')
        .insert({ memory_id: memoryId, user_email: userEmail, emoji } as any)
    }

    await loadReactions()
    setIsLoading(false)
  }

  if (!isUuid(memoryId)) {
    return (
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant/70">
        Reactions are available for uploaded memories.
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4">
      <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 mb-3">Reactions</p>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((emoji) => {
          const active = currentReaction === emoji
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => toggleReaction(emoji)}
              disabled={!userEmail || isLoading}
              className={`px-3 py-2 rounded-full border text-sm font-bold transition-all ${active
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface border-outline-variant/25 text-on-surface hover:border-primary hover:text-primary'
              } disabled:opacity-60`}
              title={!userEmail ? 'Login required' : 'Toggle reaction'}
            >
              <span className="mr-1">{emoji}</span>
              <span className="text-xs">{counts[emoji]}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
