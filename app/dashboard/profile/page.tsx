import { Bell, ChevronRight, Info, LogOut } from 'lucide-react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed } from '@/lib/access'

function initials(email: string) {
  const [name] = email.split('@')
  return name.slice(0, 2).toUpperCase()
}

const SETTINGS = [
  { label: 'Notifications', value: 'Enabled', icon: Bell },
  { label: 'About', value: 'ITP Memories v1.0', icon: Info },
  { label: 'Logout', value: '', icon: LogOut },
]

export default async function ProfilePage() {
  const accessToken = cookies().get(SUPABASE_AUTH_COOKIE)?.value
  if (!accessToken) {
    redirect('/login')
  }

  const authClient = createSupabaseServerClient()
  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)

  if (userError || !userData.user || !isEmailAllowed(userData.user.email)) {
    redirect('/login')
  }

  const email = userData.user.email ?? 'unknown@itp.local'

  return (
    <main className="space-y-3 py-3">
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary text-on-primary text-lg font-semibold flex items-center justify-center">
          {initials(email)}
        </div>
        <p className="mt-2 text-[16px] font-medium text-on-surface">{email.split('@')[0]}</p>
        <p className="text-[12px] text-on-surface-variant">{email}</p>
      </section>

      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low overflow-hidden">
        {SETTINGS.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="h-12 px-3 border-b last:border-b-0 border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface">
                <Icon size={16} />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                {item.value ? <span className="text-[12px]">{item.value}</span> : null}
                <ChevronRight size={14} />
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}
