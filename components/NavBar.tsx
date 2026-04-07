'use client'

interface NavBarProps {
  onAddMemory: () => void
  onAuthClick: () => void
  onLogout: () => void
  isAuthenticated: boolean
  userEmail: string | null
  activeSection: string
  showAddButton?: boolean
}

export default function NavBar({ onAddMemory, onAuthClick, onLogout, isAuthenticated, userEmail, showAddButton = true }: NavBarProps) {
  return (
    <nav className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3 flex items-center justify-between">
      <p className="text-sm text-on-surface">ITP Memories</p>
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <button onClick={onAuthClick} className="h-8 rounded-full px-3 text-xs bg-surface text-on-surface-variant">Dashboard</button>
            <button onClick={onLogout} className="h-8 rounded-full px-3 text-xs bg-surface text-on-surface-variant" title={userEmail ?? 'Authenticated user'}>Logout</button>
          </>
        ) : (
          <button onClick={onAuthClick} className="h-8 rounded-full px-3 text-xs bg-surface text-on-surface-variant">Login</button>
        )}
        {showAddButton && (
          <button onClick={onAddMemory} className="h-8 rounded-full px-3 text-xs bg-primary text-on-primary">Add</button>
        )}
      </div>
    </nav>
  )
}
