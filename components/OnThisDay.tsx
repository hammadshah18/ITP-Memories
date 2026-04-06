'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface OnThisDayMemory {
  id: string
  title: string
  date: string
  image_url: string | null
  is_private: boolean
  uploaded_by: string | null
  created_by_email: string | null
}

interface OnThisDayProps {
  userEmail: string | null
}

function getYearsAgoLabel(dateValue: string) {
  const currentYear = new Date().getFullYear()
  const memoryYear = new Date(dateValue).getFullYear()
  const yearsAgo = Math.max(1, currentYear - memoryYear)
  return `${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago`
}

export default function OnThisDay({ userEmail }: OnThisDayProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [memories, setMemories] = useState<OnThisDayMemory[]>([])

  useEffect(() => {
    const load = async () => {
      const now = new Date()
      const month = now.getMonth()
      const day = now.getDate()
      const yearStart = `${now.getFullYear()}-01-01`

      const visibilityFilter = userEmail
        ? `is_private.eq.false,created_by_email.eq.${userEmail},uploaded_by.eq.${userEmail}`
        : 'is_private.eq.false'

      const { data } = await supabase
        .from('memories')
        .select('id, title, date, image_url, is_private, uploaded_by, created_by_email')
        .lt('date', yearStart)
        .or(visibilityFilter)

      const rows = Array.isArray(data) ? (data as OnThisDayMemory[]) : []
      const filtered = rows
        .filter((row) => {
          const date = new Date(row.date)
          if (Number.isNaN(date.getTime())) return false
          return date.getMonth() === month && date.getDate() === day
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setMemories(filtered)
    }

    void load()
  }, [supabase, userEmail])

  if (memories.length === 0) return null

  const now = new Date()
  const todayLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-8 rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-50 via-surface to-amber-100/50 p-6"
    >
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber-700/80 font-bold mb-2">On This Day 🗓️</p>
        <h2 className="font-headline italic text-3xl text-on-surface">{todayLabel}</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {memories.map((memory) => (
          <article
            key={memory.id}
            className="min-w-[240px] max-w-[240px] rounded-2xl border border-amber-300/50 bg-white/70 backdrop-blur-sm overflow-hidden shadow-sm"
          >
            <div className="h-36 bg-amber-100/40">
              {memory.image_url ? (
                <img src={memory.image_url} alt={memory.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-700/60 text-sm font-semibold">
                  Memory
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-headline italic text-xl text-on-surface line-clamp-1">{memory.title}</h3>
              <p className="text-xs uppercase tracking-widest text-amber-700/80 font-bold mt-2">
                {getYearsAgoLabel(memory.date)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </motion.section>
  )
}
