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
      <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest/90 glass shadow-[0_40px_80px_rgba(25,28,27,0.16)] p-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-bold mb-4">Private Access</p>
        <h1 className="font-headline italic text-4xl text-primary mb-6">Admin Login</h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 rounded-xl px-4 bg-surface-container border border-outline-variant/20 focus:border-primary outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 rounded-xl px-4 bg-surface-container border border-outline-variant/20 focus:border-primary outline-none"
          />
        </div>

        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className="mt-6 w-full h-12 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-bold uppercase tracking-widest disabled:opacity-50"
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
