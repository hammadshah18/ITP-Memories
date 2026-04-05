import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Memory, FriendName } from '@/types'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { getFriendNameByEmail, isEmailAllowed } from '@/lib/access'
import DashboardClient from '@/components/DashboardClient'

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

export default async function DashboardPage() {
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
      .select('id, title, description, date, location, image_url, uploaded_by, tags, is_private, created_at, series')
      .order('date', { ascending: false })

    data = fallback.data
  }

  const memories = Array.isArray(data) ? data.map(mapRowToMemory) : []
  const currentFriendName = getFriendNameByEmail(userData.user.email)

  return <DashboardClient initialMemories={memories} userEmail={userData.user.email ?? null} currentFriendName={currentFriendName} />
}
