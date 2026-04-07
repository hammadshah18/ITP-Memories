'use client'

import { Memory } from '@/types'
import { formatDate } from '@/lib/utils'

interface MemoryCardProps {
  memory: Memory
  onClick: (memory: Memory) => void
  align?: 'left' | 'right'
  className?: string
}

export default function MemoryCard({ memory, onClick, className = '' }: MemoryCardProps) {
  return (
    <article
      onClick={() => onClick(memory)}
      className={`overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low cursor-pointer transition-opacity duration-150 hover:opacity-95 ${className}`}
    >
      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-surface-container-high">
        <img
          src={memory.imagePath}
          alt={memory.title}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.opacity = '0'
          }}
        />
      </div>

      <div className="p-3">
        <h3 className="text-[14px] font-medium text-on-surface line-clamp-1">{memory.title}</h3>
        <p className="mt-1 text-[12px] text-on-surface-variant line-clamp-1">
          {formatDate(memory.date)}{memory.location ? ` • ${memory.location}` : ''}
        </p>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-on-surface-variant/80">
          <span>❤️ 0</span>
          <span>💬 0</span>
          <span>📌 {memory.uploadedBy.split(' ')[0]}</span>
        </div>
      </div>
    </article>
  )
}
