'use client'

interface SideBarProps {
  activeSection: string
}

const sections = [
  { id: 'hero', label: 'Top' },
  { id: 'memories', label: 'Memories' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'friends', label: 'Friends' },
  { id: 'upcoming', label: 'Upcoming' },
]

export default function SideBar({ activeSection }: SideBarProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <aside className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col gap-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollTo(section.id)}
          className={`h-8 rounded-full px-3 text-[11px] ${activeSection === section.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
        >
          {section.label}
        </button>
      ))}
    </aside>
  )
}
