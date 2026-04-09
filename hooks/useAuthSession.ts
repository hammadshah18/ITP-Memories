'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface AuthUser {
  id: string
  email: string | null
}

export function useAuthSession() {
  const pathname = usePathname()
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'same-origin',
        })

        if (!res.ok) {
          if (mounted) {
            setAuthUser(null)
          }
          return
        }

        const data = await res.json()
        if (!mounted) return

        if (data?.user?.id) {
          setAuthUser({ id: data.user.id, email: data.user.email ?? null })
          return
        }

        setAuthUser(null)
      } catch {
        // Keep unauthenticated state on error.
        if (mounted) {
          setAuthUser(null)
        }
      } finally {
        if (mounted) setIsLoadingSession(false)
      }
    }

    loadSession()

    return () => {
      mounted = false
    }
  }, [pathname])

  return {
    authUser,
    setAuthUser,
    isLoadingSession,
  }
}
