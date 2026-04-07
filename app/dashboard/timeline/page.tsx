import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { TIMELINE_EVENTS } from '@/lib/data'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed } from '@/lib/access'

export default async function TimelinePage() {
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
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Timeline</p>
        <p className="text-sm text-on-surface mt-0.5">{userData.user.email ?? 'Unknown user'}</p>
        <Link
          href="/dashboard"
          className="mt-3 inline-flex h-9 items-center rounded-full border border-outline-variant/30 px-4 text-[12px] text-on-surface-variant"
        >
          Back
        </Link>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Journey Events</p>
        <div className="space-y-2">
          {TIMELINE_EVENTS.map((event) => (
            <article key={event.id} className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
              <p className="text-[11px] text-on-surface-variant">{new Date(event.date).toLocaleDateString()}</p>
              <h2 className="mt-1 text-[14px] font-medium text-on-surface">{event.title}</h2>
              <p className="mt-1 text-[12px] text-on-surface-variant">{event.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
