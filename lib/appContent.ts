export interface AppMember {
  name: string
  role: string
  bio: string
  avatar: string
}

export interface ActivityNotification {
  id: string
  text: string
  time: string
  unread?: boolean
}

export interface SearchEntry {
  id: string
  title: string
  subtitle: string
  category: 'posts' | 'memories' | 'albums' | 'profiles'
  href: string
}

export const APP_INFO = {
  name: 'ITP Memories',
  tagline: 'Shared moments. One private archive.',
  version: 'v1.0.0',
  description:
    'ITP Memories is a private memory and photo sharing app created for four close friends to preserve milestones, albums, and everyday moments in one place.',
  features: ['Share Memories', 'View Timelines', 'Create Albums', 'Tag Friends'],
}

export const GROUP_MEMBERS: AppMember[] = [
  {
    name: 'Hammad Shah',
    role: 'Timeline Keeper',
    bio: 'Keeps shared milestones organized and easy to revisit.',
    avatar: '/images/hammadshah.jpeg',
  },
  {
    name: 'Raza Khan',
    role: 'Moment Hunter',
    bio: 'Captures the candid shots that define every chapter.',
    avatar: '/images/Raza khan.jpeg',
  },
  {
    name: 'Aitzaz Hassan',
    role: 'Story Curator',
    bio: 'Turns casual memories into stories worth keeping forever.',
    avatar: '/images/Aitzaz hassan.jpeg',
  },
  {
    name: 'Hammad Masood',
    role: 'Archive Builder',
    bio: 'Builds and maintains the shared digital memory archive.',
    avatar: '/images/hammad masood.jpeg',
  },
]

export const MOCK_NOTIFICATIONS: ActivityNotification[] = [
  {
    id: 'notif-1',
    text: 'Ahmad liked your photo in Summer Retreat.',
    time: '2m ago',
    unread: true,
  },
  {
    id: 'notif-2',
    text: 'Sara commented on your memory: "This day was unforgettable!"',
    time: '25m ago',
    unread: true,
  },
  {
    id: 'notif-3',
    text: 'New album "Road Trip 2025" was created.',
    time: '1h ago',
  },
  {
    id: 'notif-4',
    text: 'You were tagged in "Infinite Horizons".',
    time: 'Yesterday',
  },
]

export const MOCK_POSTS = [
  {
    id: 'post-1',
    title: 'Where It All Began',
    subtitle: 'Timeline milestone',
    href: '/dashboard/timeline',
  },
  {
    id: 'post-2',
    title: 'The Great Road Trip',
    subtitle: 'Timeline memory highlight',
    href: '/dashboard/timeline',
  },
]

export function buildSearchIndex(memories: Array<Record<string, unknown>>): SearchEntry[] {
  const memoryEntries: SearchEntry[] = memories.map((item, index) => {
    const id = String(item.id ?? `memory-${index}`)
    const title = String(item.title ?? 'Untitled Memory')
    const date = String(item.date ?? '')
    const location = String(item.location ?? 'Unknown location')

    return {
      id,
      title,
      subtitle: `${date || 'Unknown date'} • ${location}`,
      category: 'memories',
      href: '/dashboard',
    }
  })

  const albumEntries: SearchEntry[] = Array.from(
    new Set(
      memories
        .map((item) => String(item.series ?? '').trim())
        .filter(Boolean)
    )
  ).map((series, index) => ({
    id: `album-${index}`,
    title: series,
    subtitle: 'Album',
    category: 'albums',
    href: '/dashboard/albums',
  }))

  const profileEntries: SearchEntry[] = GROUP_MEMBERS.map((member) => ({
    id: member.name,
    title: member.name,
    subtitle: member.role,
    category: 'profiles',
    href: '/dashboard/profile',
  }))

  const postEntries: SearchEntry[] = MOCK_POSTS.map((post) => ({
    id: post.id,
    title: post.title,
    subtitle: post.subtitle,
    category: 'posts',
    href: post.href,
  }))

  return [...postEntries, ...memoryEntries, ...albumEntries, ...profileEntries]
}

export function filterSearchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return entries.filter((entry) => {
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.subtitle.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q)
    )
  })
}
