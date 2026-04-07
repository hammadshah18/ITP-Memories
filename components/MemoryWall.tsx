'use client'

import { Memory } from '@/types'

interface MemoryWallProps {
  memories: Memory[]
  onMemoryClick: (memory: Memory) => void
}

export default function MemoryWall({ memories, onMemoryClick }: MemoryWallProps) {
  return (
    <section className="space-y-2 py-3">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Memory Wall</p>
      <div className="grid grid-cols-2 gap-2">
        {memories.slice(0, 8).map((memory) => (
          <button
            key={memory.id}
            type="button"
            onClick={() => onMemoryClick(memory)}
            className="rounded-xl overflow-hidden border border-outline-variant/20"
          >
            <img src={memory.imagePath} alt={memory.title} className="w-full aspect-[4/3] object-cover" />
          </button>
        ))}
      </div>
    </section>
  )
}
