'use client'

import { useMemo, useState } from 'react'
import { Memory } from '@/types'

export type DashboardFilter = 'all' | 'mine' | 'public' | 'private'

interface UseDashboardFiltersOptions {
  memories: Memory[]
  currentUserEmail: string | null
  currentFriendName: string | null
}

export function useDashboardFilters({ memories, currentUserEmail, currentFriendName }: UseDashboardFiltersOptions) {
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>('all')

  const filteredMemories = useMemo(() => {
    switch (activeFilter) {
      case 'mine':
        return memories.filter((memory) =>
          (memory.createdByEmail && currentUserEmail
            ? memory.createdByEmail.toLowerCase() === currentUserEmail.toLowerCase()
            : memory.uploadedBy === currentFriendName)
        )
      case 'public':
        return memories.filter((memory) => !memory.isPrivate)
      case 'private':
        return memories.filter((memory) => memory.isPrivate)
      default:
        return memories
    }
  }, [activeFilter, currentFriendName, currentUserEmail, memories])

  return {
    activeFilter,
    setActiveFilter,
    filteredMemories,
  }
}
