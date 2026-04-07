'use client'

import { BookOpen, Clock3, Home, PlusCircle, User } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Timeline', href: '/dashboard/timeline', icon: Clock3 },
  { label: 'Add', href: '/dashboard?add=1', icon: PlusCircle, center: true },
  { label: 'Albums', href: '/dashboard/albums', icon: BookOpen },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const isActive = (href: string) => {
    const targetPath = href.split('?')[0]
    if (targetPath === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname === targetPath
  }

  const handleNavigate = (href: string) => {
    if (href.includes('?add=1')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('add', '1')
      router.push(`/dashboard?${params.toString()}`)
      return
    }

    router.push(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/20 bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto grid h-14 w-full max-w-md grid-cols-5 items-center px-1 lg:max-w-lg">
        {ITEMS.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          if (item.center) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavigate(item.href)}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <span className="-mt-4 rounded-full bg-primary text-on-primary shadow-md p-1.5">
                  <Icon size={20} />
                </span>
                <span className="text-[10px] text-on-surface-variant">{item.label}</span>
              </button>
            )
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavigate(item.href)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 ${active ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <Icon size={17} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
