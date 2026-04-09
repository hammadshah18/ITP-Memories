'use client'

import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6 shadow-xl lg:max-w-lg">
        <div className="mx-auto flex w-full max-w-[88px] items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container p-3">
          <img
            src="/icons/icon-192x192.png"
            alt="ITP Memories"
            className="h-14 w-14 rounded-xl object-cover"
          />
        </div>

        <div className="mt-5 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 animate-pulse">
            <WifiOff size={26} className="animate-bounce" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-on-surface">You&apos;re Offline 📡</h1>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            No internet connection detected.
            <br />
            Your previously viewed memories are still available.
          </p>
        </div>

        <div className="mt-6 space-y-2 rounded-2xl border border-outline-variant/20 bg-surface-container p-4 text-sm">
          <p className="text-on-surface">✅ View saved memories</p>
          <p className="text-on-surface">✅ Browse albums</p>
          <p className="text-on-surface">✅ See your stats</p>
          <p className="text-on-surface-variant">❌ Upload new memories</p>
          <p className="text-on-surface-variant">❌ Add comments</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className="flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-on-primary"
          >
            Go to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-11 rounded-full border border-outline-variant/40 bg-surface text-sm font-semibold text-on-surface"
          >
            Try Again
          </button>
        </div>
      </section>
    </main>
  )
}
