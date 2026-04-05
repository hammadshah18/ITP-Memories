'use client'

import { useEffect, useState } from 'react'

interface AuthUser {
  id: string
  email: string | null
}

export function useAuthSession() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (!res.ok) return

        const data = await res.json()
        if (mounted && data?.user?.id) {
          setAuthUser({ id: data.user.id, email: data.user.email ?? null })
        }
      } catch {
        // Keep unauthenticated state on error.
      } finally {
        if (mounted) setIsLoadingSession(false)
      }
    }

    loadSession()

    return () => {
      mounted = false
    }
  }, [])

  return {
    authUser,
    setAuthUser,
    isLoadingSession,
  }
}
