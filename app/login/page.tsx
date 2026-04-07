'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)

    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6">
        <div className="mb-5 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">ITP</div>
          <h1 className="mt-3 text-[18px] font-semibold text-on-surface">ITP Memories</h1>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 rounded-xl px-3 bg-surface border border-outline-variant/20 focus:border-primary outline-none text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-xl px-3 bg-surface border border-outline-variant/20 focus:border-primary outline-none text-sm"
          />
        </div>

        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className="mt-5 w-full h-10 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {isSubmitting ? 'Please wait...' : 'Login'}
        </button>

        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full text-center text-xs text-on-surface-variant"
        >
          Back to home
        </button>
      </div>
    </main>
  )
}
