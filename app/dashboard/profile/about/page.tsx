import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed } from '@/lib/access'
import { APP_INFO, GROUP_MEMBERS } from '@/lib/appContent'

export default async function ProfileAboutPage() {
  const accessToken = cookies().get(SUPABASE_AUTH_COOKIE)?.value
  if (!accessToken) {
    redirect('/login')
  }

  const authClient = createSupabaseServerClient()
  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)

  if (userError || !userData.user || !isEmailAllowed(userData.user.email)) {
    redirect('/login')
  }

  return (
    <main className="space-y-3 py-3">
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
        <Link
          href="/dashboard/profile"
          className="inline-flex h-9 items-center gap-1 rounded-full border border-outline-variant/30 px-3 text-xs text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        <p className="mt-3 text-[10px] uppercase tracking-widest text-on-surface-variant">About App</p>
        <h1 className="mt-1 text-[18px] font-semibold text-on-surface">{APP_INFO.name}</h1>
        <p className="text-sm text-primary">{APP_INFO.version}</p>
        <p className="mt-2 text-sm text-on-surface-variant">{APP_INFO.description}</p>
      </section>

      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Credits</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GROUP_MEMBERS.map((member) => (
            <article key={member.name} className="rounded-xl border border-outline-variant/20 bg-surface px-3 py-2">
              <p className="text-sm font-medium text-on-surface">{member.name}</p>
              <p className="text-xs text-on-surface-variant">{member.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Contact</p>
        <div className="mt-2 space-y-1 text-sm text-on-surface">
          <p>Email: team@itpmemories.app</p>
          <p>Instagram: @itp.memories</p>
          <p>X: @itp_memories</p>
        </div>
      </section>
    </main>
  )
}
