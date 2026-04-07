'use client'

import { Memory } from '@/types'

interface ThisDayProps {
  memories: Memory[]
  onMemoryClick: (memory: Memory) => void
}

export default function ThisDay({ memories, onMemoryClick }: ThisDayProps) {
  const today = new Date()
  const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const todayMemories = memories.filter((memory) => {
    const date = new Date(memory.date)
    const md = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return md === todayMD
  })

  if (todayMemories.length === 0) return null

  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">This Day</p>
      <p className="text-sm text-on-surface mt-0.5">
        {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
      </p>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {todayMemories.map((memory) => (
          <button
            key={memory.id}
            type="button"
            onClick={() => onMemoryClick(memory)}
            className="min-w-[160px] rounded-xl border border-outline-variant/20 bg-surface text-left overflow-hidden"
          >
            <div className="h-24 bg-surface-container-high">
              <img src={memory.imagePath} alt={memory.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-2.5">
              <p className="text-[13px] font-medium text-on-surface line-clamp-1">{memory.title}</p>
              <p className="text-[11px] text-on-surface-variant">{new Date(memory.date).getFullYear()}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
