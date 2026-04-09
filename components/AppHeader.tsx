'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import {
  APP_INFO,
  GROUP_MEMBERS,
  MOCK_NOTIFICATIONS,
  SearchEntry,
  buildSearchIndex,
  filterSearchEntries,
} from '@/lib/appContent'

interface AppHeaderProps {
  title: string
  userEmail?: string | null
  showBrand?: boolean
}

function getInitials(email?: string | null) {
  if (!email) return 'IT'
  const [name] = email.split('@')
  const cleaned = name.replace(/[^a-zA-Z]/g, '')
  return cleaned.slice(0, 2).toUpperCase() || 'IT'
}

export default function AppHeader({ title, userEmail, showBrand = false }: AppHeaderProps) {
  const router = useRouter()
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIndex, setSearchIndex] = useState<SearchEntry[]>([])
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)

  const hasSearchQuery = searchQuery.trim().length > 0

  const filteredResults = useMemo(() => filterSearchEntries(searchIndex, searchQuery), [searchIndex, searchQuery])

  const groupedResults = useMemo(() => {
    return {
      posts: filteredResults.filter((item) => item.category === 'posts').slice(0, 4),
      memories: filteredResults.filter((item) => item.category === 'memories').slice(0, 4),
      albums: filteredResults.filter((item) => item.category === 'albums').slice(0, 4),
      profiles: filteredResults.filter((item) => item.category === 'profiles').slice(0, 4),
    }
  }, [filteredResults])

  const totalResults = filteredResults.length

  useEffect(() => {
    if (!isSearchOpen) return
    if (searchIndex.length > 0) return

    let mounted = true

    const loadSearchData = async () => {
      setIsLoadingSearch(true)
      try {
        const res = await fetch('/api/memories')
        const data = await res.json()
        const memories = Array.isArray(data?.memories) ? data.memories : []
        if (mounted) {
          setSearchIndex(buildSearchIndex(memories))
        }
      } catch {
        if (mounted) {
          setSearchIndex(buildSearchIndex([]))
        }
      } finally {
        if (mounted) {
          setIsLoadingSearch(false)
        }
      }
    }

    void loadSearchData()

    return () => {
      mounted = false
    }
  }, [isSearchOpen, searchIndex.length])

  const closeAllPanels = () => {
    setIsSearchOpen(false)
    setIsNotificationsOpen(false)
  }

  const handleSelectSearchResult = (entry: SearchEntry) => {
    closeAllPanels()
    router.push(entry.href)
  }

  const titleIsBrand = showBrand || title.toLowerCase() === APP_INFO.name.toLowerCase()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-outline-variant/20 bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4 lg:max-w-lg">
          <div className="flex min-w-0 items-center gap-2">
            {titleIsBrand ? (
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                className="flex min-w-0 items-center gap-2 rounded-full px-1 py-0.5 text-left transition-colors duration-150 hover:bg-surface-container"
              >
                <img
                  src="/icons/icon-192x192.png"
                  alt="ITP Memories"
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <p className="truncate text-[18px] font-semibold text-on-surface">ITP Memories</p>
              </button>
            ) : (
              <p className="truncate text-[18px] font-semibold text-on-surface">{title}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {userEmail && (
              <div className="hidden items-center gap-2 rounded-full bg-surface-container px-2.5 py-1 sm:flex">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                  {getInitials(userEmail)}
                </div>
                <span className="max-w-[92px] truncate text-[11px] text-on-surface-variant">{userEmail}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen((value) => !value)
                setIsNotificationsOpen(false)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors duration-150 hover:text-primary"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen((value) => !value)
                setIsSearchOpen(false)
              }}
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors duration-150 hover:text-primary"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {MOCK_NOTIFICATIONS.some((item) => item.unread) ? (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-error" />
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {(isSearchOpen || isNotificationsOpen) && (
        <button
          type="button"
          onClick={closeAllPanels}
          className="fixed inset-0 z-40 bg-transparent"
          aria-label="Close header panels"
        />
      )}

      {isSearchOpen && (
        <section className="fixed inset-x-0 top-14 z-50 mx-auto w-full max-w-md px-4 lg:max-w-lg">
          <div className="rounded-2xl border border-outline-variant/20 bg-surface p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Search size={15} className="text-on-surface-variant" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search posts, memories, albums, profiles"
                className="h-9 w-full rounded-xl border border-outline-variant/30 bg-surface-container px-3 text-sm text-on-surface outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={closeAllPanels}
                className="h-8 rounded-full px-3 text-xs text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Close
              </button>
            </div>

            <div className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto pb-1">
              {isLoadingSearch ? <p className="text-xs text-on-surface-variant">Searching content...</p> : null}

              {!isLoadingSearch && !hasSearchQuery ? (
                <p className="text-xs text-on-surface-variant">Start typing to search memories, albums, posts, and profiles.</p>
              ) : null}

              {!isLoadingSearch && hasSearchQuery && totalResults === 0 ? (
                <p className="rounded-xl bg-surface-container px-3 py-2 text-sm text-on-surface-variant">
                  No results found. Try another keyword.
                </p>
              ) : null}

              {totalResults > 0 ? (
                <>
                  {(['posts', 'memories', 'albums', 'profiles'] as const).map((category) => {
                    const categoryResults = groupedResults[category]
                    if (categoryResults.length === 0) return null

                    return (
                      <div key={category} className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">{category}</p>
                        {categoryResults.map((result) => (
                          <button
                            key={result.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(result)}
                            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-surface"
                          >
                            <p className="text-sm font-medium text-on-surface">{result.title}</p>
                            <p className="text-xs text-on-surface-variant">{result.subtitle}</p>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {isNotificationsOpen && (
        <section className="fixed inset-x-0 top-14 z-50 mx-auto w-full max-w-md px-4 lg:max-w-lg">
          <div className="rounded-2xl border border-outline-variant/20 bg-surface p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-on-surface">Notifications</p>
              <button
                type="button"
                onClick={closeAllPanels}
                className="h-8 rounded-full px-3 text-xs text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Close
              </button>
            </div>

            {!userEmail ? (
              <p className="rounded-xl bg-surface-container px-3 py-2 text-sm text-on-surface-variant">
                Login to see your personalized activity updates.
              </p>
            ) : (
              <div className="max-h-[60vh] space-y-2 overflow-y-auto pb-1">
                {MOCK_NOTIFICATIONS.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-on-surface">{item.text}</p>
                      {item.unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                    </div>
                    <p className="mt-1 text-[11px] text-on-surface-variant">{item.time}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {isAboutOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsAboutOpen(false)}
        >
          <section
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-outline-variant/20 bg-surface p-5 shadow-2xl lg:max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">About This App</p>
                <h2 className="mt-1 text-xl font-semibold text-on-surface">{APP_INFO.name}</h2>
                <p className="text-sm text-primary">{APP_INFO.tagline}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAboutOpen(false)}
                className="h-8 rounded-full px-3 text-xs text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-sm text-on-surface-variant">{APP_INFO.description}</p>

            <div className="mt-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Key Features</p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {APP_INFO.features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2 text-sm text-on-surface"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">The Four Friends</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {GROUP_MEMBERS.map((member) => (
                  <article
                    key={member.name}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container p-2"
                  >
                    <div className="flex items-center gap-2">
                      <img src={member.avatar} alt={member.name} className="h-11 w-11 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-on-surface">{member.name}</p>
                        <p className="truncate text-xs text-on-surface-variant">{member.role}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
