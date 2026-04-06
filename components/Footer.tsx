export default function Footer() {
  return (
    <footer className="bg-surface-container-low/60 border-t border-outline-variant/10 py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-headline text-2xl italic text-primary mb-3">Ethereal Archive</h4>
            <p className="text-xs text-on-surface-variant/60 leading-relaxed">
              Preserving the weight of history in digital vellum.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/40 font-bold mb-4">Navigate</p>
            <ul className="space-y-2">
              {['The Timeline', 'Memory Wall', 'Shared Gallery', 'Edit Archive'].map(item => (
                <li key={item}>
                  <a href="#" className="text-xs text-on-surface-variant/60 hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/40 font-bold mb-4">Connect</p>
            <ul className="space-y-2">
              {['Messages', 'Location Sync', 'Privacy Vault'].map(item => (
                <li key={item}>
                  <a href="#" className="text-xs text-on-surface-variant/60 hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Founding date */}
          <div className="flex flex-col justify-between">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-ambient">
              <span className="material-symbols-outlined text-on-primary text-lg">favorite</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-outline-variant/10 gap-4">
          <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
            © 2026 Ethereal Archive · hammad Masood, Raza Khan, Hammad Shah & Aitzaz Hasan
          </p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">favorite</span>
            <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
              Made with love since Aug 15, 2023
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
