'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface CommentRow {
  id: string
  memory_id: string
  user_email: string
  content: string
  created_at: string
}

interface MemoryCommentsProps {
  memoryId: string
  userEmail: string | null
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function formatTime(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'now'
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function MemoryComments({ memoryId, userEmail }: MemoryCommentsProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [comments, setComments] = useState<CommentRow[]>([])
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadComments = useCallback(async () => {
    if (!isUuid(memoryId)) return

    const { data } = await supabase
      .from('memory_comments')
      .select('id, memory_id, user_email, content, created_at')
      .eq('memory_id', memoryId)
      .order('created_at', { ascending: true })

    if (Array.isArray(data)) {
      setComments(data as CommentRow[])
    }
  }, [memoryId, supabase])

  useEffect(() => {
    void loadComments()

    if (!isUuid(memoryId)) return

    const channel = supabase
      .channel(`memory-comments-${memoryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memory_comments',
          filter: `memory_id=eq.${memoryId}`,
        },
        () => {
          void loadComments()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadComments, memoryId, supabase])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userEmail || !content.trim() || !isUuid(memoryId)) return

    setIsSubmitting(true)

    await supabase
      .from('memory_comments')
      .insert({
        memory_id: memoryId,
        user_email: userEmail,
        content: content.trim(),
      } as any)

    setContent('')
    setIsSubmitting(false)
  }

  if (!isUuid(memoryId)) {
    return (
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant/70">
        Comments are available for uploaded memories.
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4">
      <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 mb-3">Comments</p>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-on-surface-variant/70">No comments yet. Start the conversation.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-xl border border-outline-variant/20 bg-surface px-3 py-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs font-bold text-on-surface">{comment.user_email}</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">{formatTime(comment.created_at)}</p>
              </div>
              <p className="text-sm text-on-surface-variant">{comment.content}</p>
            </article>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={userEmail ? 'Write a comment...' : 'Login to comment'}
          disabled={!userEmail || isSubmitting}
          className="flex-1 rounded-full border border-outline-variant/25 bg-surface px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={!userEmail || !content.trim() || isSubmitting}
          className="rounded-full bg-primary text-on-primary px-4 py-2 text-xs uppercase tracking-widest font-bold disabled:opacity-60"
        >
          {isSubmitting ? 'Sending...' : 'Post'}
        </button>
      </form>
    </section>
  )
}
