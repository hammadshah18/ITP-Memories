'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Memory } from '@/types'
import UploadModal from '@/components/UploadModal'
import { DashboardFilter, useDashboardFilters } from '@/hooks/useDashboardFilters'

interface DashboardClientProps {
  initialMemories: Memory[]
  userEmail: string | null
  currentFriendName: string | null
}

const MemoryMap = dynamic(() => import('@/components/MemoryMap'), { ssr: false })

const FILTER_OPTIONS: Array<{ key: DashboardFilter; label: string }> = [
  { key: 'all', label: 'All Memories' },
  { key: 'mine', label: 'My Memories' },
  { key: 'public', label: 'Public Memories' },
  { key: 'private', label: 'Private Memories' },
]

function getCardHeightClass(memory: Memory) {
  const display = memory.displayType || 'Portrait'
  if (display === 'Landscape') return 'h-48'
  if (display === 'Story') return 'h-72'
  if (display === 'Square') return 'h-56'
  return 'h-64'
}

export default function DashboardClient({ initialMemories, userEmail, currentFriendName }: DashboardClientProps) {
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { activeFilter, setActiveFilter, filteredMemories } = useDashboardFilters({
    memories,
    currentUserEmail: userEmail,
    currentFriendName,
  })

  const sortedMemories = useMemo(
    () => [...filteredMemories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [filteredMemories]
  )

  const handleUpload = (newMemory: Memory) => {
    setMemories((prev) => [newMemory, ...prev])
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleDeleteMemory = async (memory: Memory) => {
    const shouldDelete = window.confirm(`Delete \"${memory.title}\"? This action cannot be undone.`)
    if (!shouldDelete) return

    setActionError(null)
    setDeletingMemoryId(memory.id)

    try {
      const res = await fetch('/api/memories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memory.id }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      setMemories((prev) => prev.filter((entry) => entry.id !== memory.id))
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete memory')
    } finally {
      setDeletingMemoryId(null)
    }
  }

  return (
    <main className="relative bg-surface min-h-screen py-24 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-bold mb-2">Private Dashboard</p>
            <h1 className="font-headline italic text-5xl text-on-surface">Uploaded Memories</h1>
            <p className="text-on-surface-variant/70 text-sm mt-2">Signed in as {userEmail ?? 'Unknown user'}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-5 py-3 rounded-full border border-outline-variant/30 text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              Public Home
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-3 rounded-full border border-outline-variant/30 text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              Logout
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105"
            >
              Add New Image
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setActiveFilter(option.key)}
              className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${activeFilter === option.key
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary'
              }`}
            >
              {option.label}
            </button>
          ))}

          <button
            onClick={() => setShowMap((value) => !value)}
            className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${showMap
              ? 'bg-primary-fixed text-primary'
              : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary'
            }`}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        {showMap && (
          <div className="mb-8">
            <MemoryMap memories={sortedMemories} />
          </div>
        )}

        {actionError && (
          <p className="mb-6 text-xs text-error bg-error-container/30 px-4 py-2 rounded-xl inline-block">
            {actionError}
          </p>
        )}

        {sortedMemories.length === 0 ? (
          <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low/60 p-10 text-center text-on-surface-variant">
            No uploaded memories yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedMemories.map((memory) => (
              <article key={memory.id} className="rounded-3xl overflow-hidden bg-surface-container-low shadow-ambient border border-outline-variant/10">
                <div className={`${getCardHeightClass(memory)} bg-surface-container-high relative`}>
                  <img
                    src={memory.imagePath}
                    alt={memory.title}
                    className="w-full h-full object-cover object-center"
                  />

                  <button
                    type="button"
                    onClick={() => handleDeleteMemory(memory)}
                    disabled={deletingMemoryId === memory.id}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold bg-white/90 text-error border border-white hover:bg-white disabled:opacity-60"
                  >
                    {deletingMemoryId === memory.id ? 'Deleting...' : 'Delete'}
                  </button>

                  {memory.taggedFriends && memory.taggedFriends.length > 0 && (
                    <div className="absolute top-3 left-3 flex -space-x-2">
                      {memory.taggedFriends.slice(0, 4).map((friend) => (
                        <div
                          key={`${memory.id}-${friend}`}
                          className="w-7 h-7 rounded-full bg-white/90 text-primary border border-white text-[9px] font-bold flex items-center justify-center"
                          title={friend}
                        >
                          {friend.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-headline italic text-2xl text-on-surface mb-2">{memory.title}</h2>
                  <p className="text-sm text-on-surface-variant/80 leading-relaxed mb-4 line-clamp-3">{memory.description}</p>
                  <div className="space-y-1 text-xs text-on-surface-variant/80">
                    <p><span className="font-bold text-on-surface">Date:</span> {memory.date}</p>
                    <p><span className="font-bold text-on-surface">Location:</span> {memory.location}</p>
                    <p><span className="font-bold text-on-surface">Uploaded by:</span> {memory.uploadedBy}</p>
                    <p><span className="font-bold text-on-surface">Visibility:</span> {memory.isPrivate ? 'Private' : 'Public'}</p>
                    {(memory.latitude || memory.longitude) && (
                      <p>
                        <span className="font-bold text-on-surface">Coordinates:</span> {memory.latitude ?? 'N/A'}, {memory.longitude ?? 'N/A'}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </main>
  )
}
