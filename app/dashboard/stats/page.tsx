import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed } from '@/lib/access'
import BirthdayCalendarWidget from '@/components/BirthdayCalendarWidget'

export default async function StatsPage() {
  const accessToken = cookies().get(SUPABASE_AUTH_COOKIE)?.value
  if (!accessToken) {
    redirect('/login')
  }

  const authClient = createSupabaseServerClient()
  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)

  if (userError || !userData.user || !isEmailAllowed(userData.user.email)) {
    redirect('/login')
  }

  const supabase = createSupabaseServerClient(accessToken)
  const { count: totalMemories } = await supabase
    .from('memories')
    .select('id', { count: 'exact', head: true })

  const { count: publicMemories } = await supabase
    .from('memories')
    .select('id', { count: 'exact', head: true })
    .eq('is_private', false)

  const { count: privateMemories } = await supabase
    .from('memories')
    .select('id', { count: 'exact', head: true })
    .eq('is_private', true)

  return (
    <main className="space-y-3 py-3">
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Stats</p>
        <p className="text-sm text-on-surface mt-0.5">{userData.user.email ?? 'Unknown user'}</p>
        <Link
          href="/dashboard"
          className="mt-3 inline-flex h-9 items-center rounded-full px-4 border border-outline-variant/30 text-[12px] text-on-surface-variant"
        >
          Back
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
          <p className="text-[11px] text-on-surface-variant">Total</p>
          <p className="text-2xl font-semibold text-on-surface">{totalMemories ?? 0}</p>
        </div>
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
          <p className="text-[11px] text-on-surface-variant">Public</p>
          <p className="text-2xl font-semibold text-on-surface">{publicMemories ?? 0}</p>
        </div>
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
          <p className="text-[11px] text-on-surface-variant">Private</p>
          <p className="text-2xl font-semibold text-on-surface">{privateMemories ?? 0}</p>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Charts</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <div className="h-[200px] min-w-[220px] rounded-xl border border-outline-variant/20 bg-surface-container-low p-3 flex items-end gap-2">
            <div className="w-8 rounded-md bg-primary/70" style={{ height: '72%' }} />
            <div className="w-8 rounded-md bg-primary/60" style={{ height: '55%' }} />
            <div className="w-8 rounded-md bg-primary/50" style={{ height: '40%' }} />
            <div className="w-8 rounded-md bg-primary/40" style={{ height: '65%' }} />
          </div>
          <div className="h-[200px] min-w-[220px] rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
            <BirthdayCalendarWidget />
          </div>
        </div>
      </section>
    </main>
  )
}
