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
    <main className="space-y-3 py-3">
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Albums</p>
        <p className="text-sm text-on-surface mt-0.5">
          {userData.user.email ?? currentFriendName ?? 'Unknown user'}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <PhotobookExport memories={memories} buttonLabel="Photobook" />
          <Link
            href="/dashboard"
            className="h-9 rounded-full px-4 border border-outline-variant/30 text-[12px] text-on-surface-variant flex items-center"
          >
            Back
          </Link>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Album Memories ({memories.length})</p>
          {memories.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No memories available yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {memories.map((memory) => (
                <article key={memory.id} className="rounded-xl border border-outline-variant/20 bg-surface overflow-hidden">
                  <div className="aspect-[16/9] bg-surface-container-high">
                    <img src={memory.imagePath} alt={memory.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h2 className="text-[14px] font-medium text-on-surface line-clamp-1">{memory.title}</h2>
                    <p className="text-[12px] text-on-surface-variant mt-1">
                      {new Date(memory.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  )
}
