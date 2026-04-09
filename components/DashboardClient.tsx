'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Memory } from '@/types'
import UploadModal from './UploadModal'
import BirthdayBanner from '@/components/BirthdayBanner'
import PhotobookExport from '@/components/PhotobookExport'
import MemoryDetail from '@/components/MemoryDetail'
import OnThisDay from '@/components/OnThisDay'
import { subscribePush } from '@/lib/subscribePush'
import { ALLOWED_EMAILS } from '@/lib/access'
import { FRIENDS_BIRTHDAYS, getDaysUntilBirthday } from '@/lib/birthdays'
import { DashboardFilter, useDashboardFilters } from '@/hooks/useDashboardFilters'

interface DashboardClientProps {
  initialMemories: Memory[]
  userEmail: string | null
  currentFriendName: string | null
}

const CACHED_MEMORIES_KEY = 'cached_memories'
const CACHED_MEMORIES_TIME_KEY = 'cached_memories_time'

const MemoryMap = dynamic(() => import('@/components/MemoryMap'), { ssr: false })

const FILTER_OPTIONS: Array<{ key: DashboardFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'Mine' },
  { key: 'public', label: 'Public' },
  { key: 'private', label: 'Private' },
]

const STORIES: Array<{ name: string; image: string }> = [
  { name: 'Hammad Shah', image: '/images/hammadshah.jpeg' },
  { name: 'Aitzaz Hassan', image: '/images/Aitzaz hassan.jpeg' },
  { name: 'Hammad Masood', image: '/images/hammad masood.jpeg' },
  { name: 'Raza Khan', image: '/images/Raza khan.jpeg' },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function DashboardClientContent({ initialMemories, userEmail, currentFriendName }: DashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [isUsingCachedData, setIsUsingCachedData] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

  const { activeFilter, setActiveFilter, filteredMemories } = useDashboardFilters({
    memories,
    currentUserEmail: userEmail,
    currentFriendName,
  })

  const sortedMemories = useMemo(
    () => [...filteredMemories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [filteredMemories]
  )

  useEffect(() => {
    if (!userEmail) return
    void subscribePush({ userEmail })
  }, [userEmail])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(CACHED_MEMORIES_KEY, JSON.stringify(memories))
    localStorage.setItem(CACHED_MEMORIES_TIME_KEY, Date.now().toString())
  }, [memories])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true

    const applyCachedMemories = () => {
      const cached = localStorage.getItem(CACHED_MEMORIES_KEY)
      if (!cached) return false

      try {
        const parsed = JSON.parse(cached)
        if (!Array.isArray(parsed)) return false
        if (!mounted) return true

        setMemories(parsed as Memory[])
        setIsUsingCachedData(true)
        return true
      } catch {
        return false
      }
    }

    const syncMemories = async () => {
      if (!navigator.onLine) {
        applyCachedMemories()
        return
      }

      try {
        const res = await fetch('/api/memories', {
          cache: 'no-store',
          credentials: 'same-origin',
        })

        if (!res.ok) {
          throw new Error('Failed to fetch memories')
        }

        const data = await res.json()
        if (!mounted) return

        const liveMemories = Array.isArray(data?.memories)
          ? (data.memories as Memory[])
          : []

        setMemories(liveMemories)
        setIsUsingCachedData(false)
      } catch {
        applyCachedMemories()
      }
    }

    void syncMemories()

    const handleOnline = () => {
      void syncMemories()
    }

    window.addEventListener('online', handleOnline)

    return () => {
      mounted = false
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setIsUploadOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (!userEmail) return

    const todayBirthday = FRIENDS_BIRTHDAYS.find((friend) => getDaysUntilBirthday(friend) === 0)
    const upcomingBirthday = FRIENDS_BIRTHDAYS
      .map((friend) => ({ ...friend, days: getDaysUntilBirthday(friend) }))
      .filter((friend) => friend.days > 0 && friend.days <= 7)
      .sort((a, b) => a.days - b.days)[0]

    if (!todayBirthday && !upcomingBirthday) return

    const dateKey = new Date().toISOString().slice(0, 10)
    const notifyKey = `itp-birthday-push-${dateKey}`
    if (typeof window !== 'undefined' && localStorage.getItem(notifyKey) === '1') {
      return
    }

    const title = todayBirthday ? `Happy Birthday ${todayBirthday.name}! 🎂` : 'Birthday Reminder 🎁'

    const body = todayBirthday
      ? `${todayBirthday.name} has a birthday today. Celebrate in ITP Memories!`
      : `${upcomingBirthday?.name}'s birthday is in ${upcomingBirthday?.days} day${upcomingBirthday?.days === 1 ? '' : 's'}.`

    void fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        body,
        url: '/dashboard',
        recipients: ALLOWED_EMAILS,
      }),
    }).finally(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(notifyKey, '1')
      }
    })
  }, [userEmail])

  const handleUpload = (newMemory: Memory) => {
    setMemories((prev) => [newMemory, ...prev])
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleDeleteMemory = async (memory: Memory) => {
    const shouldDelete = window.confirm(`Delete "${memory.title}"? This action cannot be undone.`)
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

  const closeUpload = () => {
    setIsUploadOpen(false)
    if (searchParams.get('add') === '1') {
      router.replace('/dashboard')
    }
  }

  return (
    <main className="space-y-3 py-3">
      <BirthdayBanner />

      <OnThisDay userEmail={userEmail} />

      {isUsingCachedData ? (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Showing cached data
        </p>
      ) : null}

      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Signed in</p>
        <p className="mt-0.5 text-sm text-on-surface truncate">{userEmail ?? 'Unknown user'}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <PhotobookExport memories={sortedMemories} buttonLabel="Photobook" />
          <button
            onClick={() => router.push('/dashboard/albums')}
            className="h-9 rounded-full px-4 border border-outline-variant/30 text-xs text-on-surface-variant transition-colors duration-150 hover:text-primary"
          >
            Albums
          </button>
          <button
            onClick={() => router.push('/dashboard/stats')}
            className="h-9 rounded-full px-4 border border-outline-variant/30 text-xs text-on-surface-variant transition-colors duration-150 hover:text-primary"
          >
            Stats
          </button>
          <button
            onClick={handleLogout}
            className="h-9 rounded-full px-4 border border-outline-variant/30 text-xs text-on-surface-variant transition-colors duration-150 hover:text-primary"
          >
            Logout
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Stories</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {STORIES.map((story) => (
            <div key={story.name} className="w-[72px] shrink-0 text-center">
              <div className="mx-auto h-12 w-12 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container">
                <img
                  src={story.image}
                  alt={story.name}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const target = event.currentTarget
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLSpanElement | null
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
                <span className="h-full w-full hidden items-center justify-center text-xs font-semibold text-primary">
                  {getInitials(story.name)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-on-surface-variant line-clamp-2">{story.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setActiveFilter(option.key)}
              className={`h-8 rounded-full px-3 text-[11px] transition-colors duration-150 ${
                activeFilter === option.key
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              {option.label}
            </button>
          ))}

          <button
            onClick={() => setShowMap((value) => !value)}
            className={`h-8 rounded-full px-3 text-[11px] transition-colors duration-150 ${
              showMap
                ? 'bg-primary-fixed text-primary'
                : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'
            }`}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        {showMap && (
          <div className="rounded-2xl border border-outline-variant/20 overflow-hidden">
            <MemoryMap memories={sortedMemories} />
          </div>
        )}
      </section>

      {actionError && (
        <p className="rounded-xl bg-error-container/40 px-3 py-2 text-xs text-error">{actionError}</p>
      )}

      {sortedMemories.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
          No uploaded memories yet.
        </div>
      ) : (
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Memory Feed</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {sortedMemories.map((memory) => (
              <article
                key={memory.id}
                onClick={() => setSelectedMemory(memory)}
                className="rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-low cursor-pointer"
              >
                <div className="aspect-[16/9] bg-surface-container-high relative">
                  <img
                    src={memory.imagePath}
                    alt={memory.title}
                    className="w-full h-full object-cover object-center"
                  />

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      void handleDeleteMemory(memory)
                    }}
                    disabled={deletingMemoryId === memory.id}
                    className="absolute top-2 right-2 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] text-error"
                  >
                    {deletingMemoryId === memory.id ? 'Deleting' : 'Delete'}
                  </button>
                </div>

                <div className="p-3">
                  <h2 className="text-[14px] font-medium text-on-surface line-clamp-1">{memory.title}</h2>
                  <p className="mt-1 text-[12px] text-on-surface-variant line-clamp-1">
                    {memory.date} • {memory.location}
                  </p>
                  <p className="mt-2 text-[12px] text-on-surface-variant/80 line-clamp-2">{memory.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <UploadModal
        isOpen={isUploadOpen}
        onClose={closeUpload}
        onUpload={handleUpload}
      />

      <MemoryDetail
        memory={selectedMemory}
        memories={sortedMemories}
        onClose={() => setSelectedMemory(null)}
        onPrev={() => {
          if (!selectedMemory) return
          const index = sortedMemories.findIndex((entry) => entry.id === selectedMemory.id)
          if (index > 0) {
            setSelectedMemory(sortedMemories[index - 1])
          }
        }}
        onNext={() => {
          if (!selectedMemory) return
          const index = sortedMemories.findIndex((entry) => entry.id === selectedMemory.id)
          if (index >= 0 && index < sortedMemories.length - 1) {
            setSelectedMemory(sortedMemories[index + 1])
          }
        }}
      />
    </main>
  )
}

export default function DashboardClient(props: DashboardClientProps) {
  return (
    <Suspense fallback={null}>
      <DashboardClientContent {...props} />
    </Suspense>
  )
}
