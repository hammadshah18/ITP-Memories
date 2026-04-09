'use client'

import { useEffect, useRef, useState } from 'react'

type BannerMode = 'offline' | 'online' | null

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [mode, setMode] = useState<BannerMode>(null)
  const onlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    setIsOnline(initialOnline)
    if (!initialOnline) {
      setMode('offline')
    }

    const handleOffline = () => {
      setIsOnline(false)
      if (onlineTimerRef.current) {
        clearTimeout(onlineTimerRef.current)
        onlineTimerRef.current = null
      }
      setMode('offline')
    }

    const handleOnline = () => {
      setIsOnline(true)
      setMode('online')
      if (onlineTimerRef.current) {
        clearTimeout(onlineTimerRef.current)
      }
      onlineTimerRef.current = setTimeout(() => {
        setMode(null)
      }, 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      if (onlineTimerRef.current) {
        clearTimeout(onlineTimerRef.current)
      }
    }
  }, [])

  if (mode === null) {
    return null
  }

  if (!isOnline && mode === 'offline') {
    return (
      <div className="fixed inset-x-0 top-0 z-[120] px-3 pt-2">
        <div className="mx-auto w-full max-w-md rounded-xl border border-amber-500/50 bg-amber-300 px-3 py-2 text-center text-xs font-semibold text-amber-950 shadow-lg lg:max-w-lg">
          📡 You&apos;re offline — showing cached memories
        </div>
      </div>
    )
  }

  if (mode === 'online') {
    return (
      <div className="fixed inset-x-0 top-0 z-[120] px-3 pt-2">
        <div className="mx-auto w-full max-w-md rounded-xl border border-emerald-500/40 bg-emerald-400 px-3 py-2 text-center text-xs font-semibold text-emerald-950 shadow-lg lg:max-w-lg">
          ✅ Back online!
        </div>
      </div>
    )
  }

  return null
}
