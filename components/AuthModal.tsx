'use client'

import { useMemo, useState } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const endpoint = useMemo(() => (mode === 'login' ? '/api/auth/login' : '/api/auth/signup'), [mode])

  if (!isOpen) return null

  const handleSubmit = async () => {
    setError(null)
    setMessage(null)

    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      if (data.requiresEmailConfirmation) {
        setMessage('Signup succeeded. Please verify your email before logging in.')
        return
      }

      onAuthSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl bg-surface-container-lowest/90 glass shadow-[0_40px_80px_rgba(25,28,27,0.16)] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline italic text-3xl text-primary">
            {mode === 'login' ? 'Admin Login' : 'Create Admin'}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

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
        {message && <p className="mt-4 text-sm text-primary">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-6 w-full h-12 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
        </button>

        {mode === 'signup' && (
          <p className="mt-3 text-[11px] text-on-surface-variant/70 text-center">
            Signup is limited to approved emails only.
          </p>
        )}

        <button
          onClick={() => {
            setError(null)
            setMessage(null)
            setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
          }}
          className="mt-4 w-full text-center text-xs text-on-surface-variant"
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  )
}
