'use client'

import { Memory } from '@/types'
import MemoryCard from '@/components/MemoryCard'

interface MemoriesSectionProps {
  memories: Memory[]
  onMemoryClick: (memory: Memory) => void
}

export default function MemoriesSection({ memories, onMemoryClick }: MemoriesSectionProps) {
  return (
    <section id="memories" className="space-y-2 py-3">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Memories</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {memories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} onClick={onMemoryClick} />
        ))}
      </div>
    </section>
  )
}
