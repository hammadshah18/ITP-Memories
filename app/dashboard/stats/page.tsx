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
    <main className="bg-surface min-h-screen py-20 px-6 md:px-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-bold mb-2">Dashboard</p>
            <h1 className="font-headline italic text-5xl text-on-surface">Stats</h1>
            <p className="text-sm text-on-surface-variant/70 mt-2">
              Signed in as {userData.user.email ?? 'Unknown user'}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-5 py-3 rounded-full border border-outline-variant/30 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant/80 font-bold mb-2">Total Memories</p>
            <p className="font-headline italic text-4xl text-on-surface">{totalMemories ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant/80 font-bold mb-2">Public</p>
            <p className="font-headline italic text-4xl text-on-surface">{publicMemories ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant/80 font-bold mb-2">Private</p>
            <p className="font-headline italic text-4xl text-on-surface">{privateMemories ?? 0}</p>
          </div>
        </section>

        <BirthdayCalendarWidget />
      </div>
    </main>
  )
}
