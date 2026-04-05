import { type ClassValue, clsx } from 'clsx'
import { Memory } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase()
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
}

export function getMemoriesByYear(memories: Memory[]): Record<string, Memory[]> {
  return memories.reduce((acc, memory) => {
    const year = new Date(memory.date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(memory)
    return acc
  }, {} as Record<string, Memory[]>)
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('')
}

export function daysSince(dateStr: string): number {
  const start = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function generatePlaceholderGradient(seed: string): string {
  const colors = [
    'from-primary-fixed to-secondary-container',
    'from-secondary-fixed to-tertiary-fixed',
    'from-tertiary-fixed to-primary-fixed',
    'from-primary-container to-secondary-container',
  ]
  const index = seed.charCodeAt(0) % colors.length
  return colors[index]
}
