'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import AppHeader from '@/components/AppHeader'
import BottomNav from '@/components/BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

const TITLES: Record<string, string> = {
  '/': 'ITP Memories',
  '/dashboard': 'Memories',
  '/dashboard/albums': 'Albums',
  '/dashboard/stats': 'Stats',
  '/dashboard/timeline': 'Timeline',
  '/dashboard/profile': 'Profile',
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { authUser } = useAuthSession()

  const isLoginPage = pathname === '/login'
  const isDashboardArea = pathname.startsWith('/dashboard')

  const title = useMemo(() => TITLES[pathname] ?? 'ITP Memories', [pathname])

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader title={title} userEmail={authUser?.email ?? null} showBrand={!isDashboardArea} />
      <div className="mx-auto w-full max-w-md px-4 pt-14 pb-16 lg:max-w-lg">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
