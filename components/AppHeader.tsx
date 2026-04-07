'use client'

import { Bell, Search } from 'lucide-react'

interface AppHeaderProps {
  title: string
  userEmail?: string | null
  showBrand?: boolean
}

function getInitials(email?: string | null) {
  if (!email) return 'IT'
  const [name] = email.split('@')
  const cleaned = name.replace(/[^a-zA-Z]/g, '')
  return cleaned.slice(0, 2).toUpperCase() || 'IT'
}

export default function AppHeader({ title, userEmail, showBrand = false }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-outline-variant/20 bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4 lg:max-w-lg">
        <div className="flex items-center gap-2 min-w-0">
          {showBrand ? (
            <>
              <div className="h-8 w-8 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center">ITP</div>
              <p className="text-[18px] font-semibold text-on-surface truncate">ITP Memories</p>
            </>
          ) : (
            <p className="text-[18px] font-semibold text-on-surface truncate">{title}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {userEmail && (
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-surface-container px-2.5 py-1">
              <div className="h-6 w-6 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                {getInitials(userEmail)}
              </div>
              <span className="max-w-[92px] truncate text-[11px] text-on-surface-variant">{userEmail}</span>
            </div>
          )}
          <button className="h-8 w-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors duration-150 hover:text-primary" aria-label="Search">
            <Search size={16} />
          </button>
          <button className="h-8 w-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors duration-150 hover:text-primary" aria-label="Notifications">
            <Bell size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
