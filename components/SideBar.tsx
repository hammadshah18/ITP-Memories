'use client'

interface SideBarProps {
  activeSection: string
}

const sections = [
  { id: 'hero', icon: 'home', label: 'Top' },
  { id: 'memories', icon: 'auto_stories', label: '2023' },
  { id: 'timeline', icon: 'history', label: 'Journey' },
  { id: 'friends', icon: 'group', label: 'Us' },
  { id: 'upcoming', icon: 'event_note', label: 'Future' },
]

export default function SideBar({ activeSection }: SideBarProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <aside className="fixed left-8 top-1/2 -translate-y-1/2 w-12 flex flex-col items-center gap-6 z-40 hidden lg:flex">
      {/* Vertical line */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px timeline-line opacity-40" />

      {sections.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className="relative flex flex-col items-center gap-1 group"
        >
          {/* Dot */}
          <div className={`
            w-2 h-2 rounded-full border-2 transition-all duration-300 z-10
            ${activeSection === id
              ? 'bg-primary border-primary scale-150'
              : 'bg-surface border-outline-variant/40 group-hover:border-primary group-hover:scale-125'
            }
          `} />

          {/* Label tooltip */}
          <span className={`
            absolute left-6 text-[9px] uppercase tracking-widest font-bold
            whitespace-nowrap transition-all duration-300 opacity-0 group-hover:opacity-100
            ${activeSection === id ? 'text-primary opacity-100' : 'text-on-surface-variant'}
          `}>
            {label}
          </span>
        </button>
      ))}
    </aside>
  )
}
