'use client'

import { useRef, useState } from 'react'
import { Memory } from '@/types'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

interface MemoryCardProps {
  memory: Memory
  onClick: (memory: Memory) => void
  align?: 'left' | 'right'
  className?: string
}

const GRADIENT_FALLBACKS: Record<string, string> = {
  'hammad Masood': 'from-primary-fixed to-secondary-container',
  'Raza Khan': 'from-secondary-fixed to-tertiary-fixed',
  'Hammad Shah': 'from-tertiary-fixed to-primary-fixed',
  'Aitzaz Hasan': 'from-primary-container to-secondary-container',
}

export default function MemoryCard({ memory, onClick, align = 'left', className = '' }: MemoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [hasImageError, setHasImageError] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const x = ((e.clientY - cy) / rect.height) * 3
    const y = -((e.clientX - cx) / rect.width) * 3
    setRotation({ x, y })
  }

  return (
    <motion.div
      className={`flex items-center gap-12 ${align === 'right' ? 'flex-row-reverse' : ''} ${className}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {/* Image */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setRotation({ x: 0, y: 0 })
        }}
        onClick={() => onClick(memory)}
        className="flex-shrink-0 w-64 h-72 md:w-80 md:h-96 rounded-3xl overflow-hidden cursor-pointer shadow-ambient-md relative group"
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${isHovered ? 'translateY(-6px)' : ''}`,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          boxShadow: isHovered
            ? '0 20px 40px rgba(25,28,27,0.12), inset 0 1px 0 rgba(201,236,198,0.6)'
            : undefined,
        }}
      >
        {/* Gradient fallback background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_FALLBACKS[memory.uploadedBy] || 'from-primary-fixed to-secondary-container'}`} />

        {!hasImageError && memory.imagePath ? (
          <img
            src={memory.imagePath}
            alt={memory.title}
            className="absolute inset-0 w-full h-full object-cover scroll-rotate group-hover:scale-105 transition-transform duration-700"
            onError={() => setHasImageError(true)}
          />
        ) : null}

        {/* Overlay text on hover */}
        <div className={`
          absolute inset-0 bg-on-surface/20 flex items-end p-4
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <span className="text-white/90 text-xs font-label uppercase tracking-widest">View Memory</span>
        </div>

        {/* Image placeholder content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center opacity-40">
            <span className="material-symbols-outlined text-5xl text-primary/60">photo_library</span>
            <p className="text-xs text-primary/60 mt-2 font-label">
              {memory.uploadedBy.split(' ')[0]}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Text */}
      <div className={`flex-1 max-w-xs ${align === 'right' ? 'text-right' : ''}`}>
        <p className="text-[10px] uppercase tracking-[0.25em] text-primary/60 font-bold mb-3">
          {memory.series || formatDate(memory.date)}
        </p>
        <h3 className="font-headline text-3xl md:text-4xl italic text-on-surface leading-tight mb-4">
          {memory.title}
        </h3>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-3">
          {memory.description}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`
            text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full
            bg-primary-fixed/60 text-primary
          `}>
            {memory.uploadedBy.split(' ')[0]}
          </span>
          {memory.location && (
            <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {memory.location}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
