'use client'

import { useEffect, useCallback, useState } from 'react'
import { Memory } from '@/types'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useAuthSession } from '@/hooks/useAuthSession'
import MemoryReactions from '@/components/MemoryReactions'
import MemoryComments from '@/components/MemoryComments'

interface MemoryDetailProps {
  memory: Memory | null
  memories: Memory[]
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const GRADIENT_FALLBACKS: Record<string, string> = {
  'hammad Masood': 'linear-gradient(135deg, #c9ecc6, #9ebf9c)',
  'Raza Khan': 'linear-gradient(135deg, #ceeacd, #b3ceb2)',
  'Hammad Shah': 'linear-gradient(135deg, #d8e6d8, #acbaad)',
  'Aitzaz Hasan': 'linear-gradient(135deg, #9ebf9c, #486648)',
}

export default function MemoryDetail({ memory, memories, onClose, onPrev, onNext }: MemoryDetailProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const { authUser } = useAuthSession()

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') onPrev()
    if (e.key === 'ArrowRight') onNext()
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    if (memory) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
      setHasImageError(false)
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [memory, handleKey])

  if (!memory) return null

  const currentIndex = memories.indexOf(memory)

  return (
    <div
      className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest/90 glass w-full max-w-2xl rounded-[2rem] shadow-[0_40px_80px_rgba(25,28,27,0.15)] overflow-hidden relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-outline-variant/10">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-on-surface-variant/60 hover:text-primary transition-colors text-xs uppercase tracking-widest font-bold"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Close
          </button>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors group">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">favorite</span>
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors group">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">share</span>
            </button>
            <div className="w-px h-5 bg-outline-variant/30" />
            <button
              onClick={onPrev}
              disabled={currentIndex <= 0}
              className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_left</span>
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex >= memories.length - 1}
              className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Image */}
        <div
          className="w-full aspect-[16/9] relative"
          style={{ background: GRADIENT_FALLBACKS[memory.uploadedBy] }}
        >
          {!hasImageError && memory.imagePath ? (
            <motion.img
              src={memory.imagePath}
              alt={memory.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.06, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onError={() => setHasImageError(true)}
            />
          ) : null}

          {hasImageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/40">image</span>
                <p className="text-white/50 text-sm mt-2 font-label uppercase tracking-widest">Memory by {memory.uploadedBy}</p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Tags */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {memory.series && (
              <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary-fixed/60 text-primary">
                {memory.series}
              </span>
            )}
            <span className="text-on-surface-variant/60 text-xs uppercase tracking-widest">
              {formatDate(memory.date)}
            </span>
          </div>

          <h2 className="font-headline text-4xl italic text-on-surface leading-tight mb-3">
            {memory.title}
          </h2>

          {/* Action button */}
          <button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-label text-xs font-bold uppercase tracking-[0.15em] py-4 rounded-full mb-6 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">print</span>
            Order Physical Print
          </button>

          {/* Description */}
          <p className="font-body text-on-surface-variant leading-relaxed text-sm mb-6">
            {memory.description}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-[9px] font-bold">
                {memory.uploadedBy.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">{memory.uploadedBy}</p>
                <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">Uploaded this memory</p>
              </div>
            </div>
            {memory.location && (
              <div className="flex items-center gap-1 text-on-surface-variant/60 text-xs">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {memory.location}
              </div>
            )}
          </div>

          {/* Tags */}
          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {memory.tags.map(tag => (
                <span key={tag} className="text-[9px] uppercase tracking-widest text-on-surface-variant/50 bg-surface-container px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <MemoryReactions memoryId={memory.id} userEmail={authUser?.email ?? null} />
            <MemoryComments memoryId={memory.id} userEmail={authUser?.email ?? null} />
          </div>
        </div>
      </div>
    </div>
  )
}
