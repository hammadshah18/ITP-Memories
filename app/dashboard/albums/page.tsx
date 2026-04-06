import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Memory, FriendName } from '@/types'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { getFriendNameByEmail, isEmailAllowed } from '@/lib/access'
import PhotobookExport from '@/components/PhotobookExport'

function mapRowToMemory(row: Record<string, unknown>): Memory {
  const latitude = row.latitude
  const longitude = row.longitude

  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    date: String(row.date ?? ''),
    location: String(row.location ?? 'Unknown Location'),
    imagePath: String(row.image_url ?? '/memories/placeholder.jpg'),
    uploadedBy: String(row.uploaded_by ?? 'hammad Masood') as FriendName,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    isPrivate: Boolean(row.is_private),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    series: row.series ? String(row.series) : undefined,
    taggedFriends: Array.isArray(row.tagged_friends) ? row.tagged_friends.map(String) : [],
    latitude: typeof latitude === 'number' ? latitude : latitude ? Number(latitude) : null,
    longitude: typeof longitude === 'number' ? longitude : longitude ? Number(longitude) : null,
    aspectRatio: row.aspect_ratio ? String(row.aspect_ratio) as Memory['aspectRatio'] : undefined,
    displayType: row.display_type ? String(row.display_type) as Memory['displayType'] : undefined,
    createdByEmail: row.created_by_email ? String(row.created_by_email) : null,
  }
}

export default async function AlbumsPage() {
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
  const extended = await supabase
    .from('memories')
    .select('id, title, description, date, location, image_url, uploaded_by, tags, is_private, created_at, series, tagged_friends, latitude, longitude, aspect_ratio, display_type, created_by_email')
    .order('date', { ascending: false })

  let data = extended.data

  if (extended.error?.message?.toLowerCase().includes('column')) {
    const fallback = await supabase
      .from('memories')
      .select('*')
      .order('date', { ascending: false })

    data = fallback.data
  }

  const memories = Array.isArray(data) ? data.map(mapRowToMemory) : []
  const currentFriendName = getFriendNameByEmail(userData.user.email)

  return (
    <main className="bg-surface min-h-screen py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-bold mb-2">Dashboard</p>
            <h1 className="font-headline italic text-5xl text-on-surface">Albums</h1>
            <p className="text-sm text-on-surface-variant/70 mt-2">
              Signed in as {userData.user.email ?? currentFriendName ?? 'Unknown user'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <PhotobookExport memories={memories} buttonLabel="Download Entire Album 📖" />
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-full border border-outline-variant/30 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant/80 font-bold mb-4">Album Memories ({memories.length})</p>
          {memories.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No memories available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memories.map((memory) => (
                <article key={memory.id} className="rounded-2xl border border-outline-variant/15 bg-surface overflow-hidden">
                  <div className="h-44 bg-surface-container-high">
                    <img src={memory.imagePath} alt={memory.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h2 className="font-headline italic text-2xl text-on-surface line-clamp-1">{memory.title}</h2>
                    <p className="text-xs text-on-surface-variant/70 mt-1">
                      {new Date(memory.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
