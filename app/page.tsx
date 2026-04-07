'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Memory } from '@/types'
import { INITIAL_MEMORIES } from '@/lib/data'
import { useAuthSession } from '@/hooks/useAuthSession'
import BirthdayBanner from '@/components/BirthdayBanner'
import ThisDay from '@/components/ThisDay'
import MemoryCard from '@/components/MemoryCard'
import MemoryDetail from '@/components/MemoryDetail'

export default function Home() {
  const router = useRouter()
  const memories = useMemo(() => INITIAL_MEMORIES, [])
  const { authUser } = useAuthSession()
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

  const handleMemoryClick = useCallback((memory: Memory) => {
    setSelectedMemory(memory)
  }, [])

  const handlePrev = useCallback(() => {
    if (!selectedMemory) return
    const idx = memories.indexOf(selectedMemory)
    if (idx > 0) setSelectedMemory(memories[idx - 1])
  }, [selectedMemory, memories])

  const handleNext = useCallback(() => {
    if (!selectedMemory) return
    const idx = memories.indexOf(selectedMemory)
    if (idx < memories.length - 1) setSelectedMemory(memories[idx + 1])
  }, [selectedMemory, memories])

  return (
    <main className="space-y-4 py-3">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Private Memories App</p>
          <p className="text-sm text-on-surface">ITP Memories</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(authUser ? '/dashboard' : '/login')}
          className="h-9 rounded-full px-4 bg-primary text-on-primary text-xs font-semibold transition-opacity duration-150 hover:opacity-90"
        >
          {authUser ? 'Dashboard' : 'Login'}
        </button>
      </div>

      <BirthdayBanner />

      <ThisDay memories={memories} onMemoryClick={handleMemoryClick} />

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Latest Memories</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} onClick={handleMemoryClick} />
          ))}
        </div>
      </section>

      <p className="py-2 text-center text-[10px] uppercase tracking-widest text-on-surface-variant/70">ITP Memories v1.0</p>

      <MemoryDetail
        memory={selectedMemory}
        memories={memories}
        onClose={() => setSelectedMemory(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </main>
  )
}
