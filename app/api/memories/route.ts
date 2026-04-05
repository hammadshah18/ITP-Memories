import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { Memory, FriendName } from '@/types'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed } from '@/lib/access'

const MEMORY_BUCKET = 'memories'

function extractStorageObjectPath(imageUrl: string) {
  try {
    const parsed = new URL(imageUrl)
    const path = parsed.pathname

    const signPrefix = '/storage/v1/object/sign/memories/'
    const publicPrefix = '/storage/v1/object/public/memories/'

    if (path.includes(signPrefix)) {
      const raw = path.split(signPrefix)[1] || ''
      return decodeURIComponent(raw)
    }

    if (path.includes(publicPrefix)) {
      const raw = path.split(publicPrefix)[1] || ''
      return decodeURIComponent(raw)
    }

    return null
  } catch {
    return null
  }
}

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

async function getAuthenticatedUser(request: NextRequest) {
  const accessToken = request.cookies.get(SUPABASE_AUTH_COOKIE)?.value
  if (!accessToken) return null

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser(accessToken)
  if (error || !data.user || !isEmailAllowed(data.user.email)) {
    console.log(error)
    return null
  }

  return { user: data.user, accessToken }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth?.user || !auth.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()

    const file = formData.get('image') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const location = formData.get('location') as string
    const uploadedBy = formData.get('uploadedBy') as FriendName
    const tags = formData.get('tags') as string
    const isPrivate = formData.get('isPrivate') === 'true'
    const series = formData.get('series') as string | undefined
    const taggedFriendsRaw = formData.get('taggedFriends') as string | null
    const latitudeRaw = formData.get('latitude') as string | null
    const longitudeRaw = formData.get('longitude') as string | null
    const aspectRatio = (formData.get('aspectRatio') as Memory['aspectRatio']) || '3:4'
    const displayType = (formData.get('displayType') as Memory['displayType']) || 'Portrait'

    if (!title || !description || !date || !uploadedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, date, uploadedBy' },
        { status: 400 }
      )
    }

    let imagePath = '/memories/placeholder.jpg'
    const supabase = createSupabaseServerClient(auth.accessToken)

    if (file && file.size > 0) {
      const year = new Date(date).getFullYear().toString()
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const extensionFromName = file.name.includes('.')
        ? file.name.split('.').pop()?.toLowerCase()
        : undefined
      const extensionFromType = file.type.startsWith('image/')
        ? file.type.split('/')[1]?.toLowerCase()
        : undefined
      const ext = extensionFromName || extensionFromType || 'jpg'
      const filename = `memories/${year}/${uuidv4()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(MEMORY_BUCKET)
        .upload(filename, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json(
          { error: `Failed to upload image: ${uploadError.message}` },
          { status: 502 }
        )
      }

      const { data: signedData, error: signedUrlError } = await supabase.storage
        .from(MEMORY_BUCKET)
        .createSignedUrl(filename, 60 * 60 * 24 * 365 * 10)

      if (signedUrlError || !signedData?.signedUrl) {
        return NextResponse.json(
          { error: `Failed to create image URL: ${signedUrlError?.message ?? 'Unknown error'}` },
          { status: 502 }
        )
      }

      imagePath = signedData.signedUrl
    }

    const memoryId = uuidv4()
    const createdAt = new Date().toISOString()

    let taggedFriends: string[] = []
    if (taggedFriendsRaw) {
      try {
        const parsed = JSON.parse(taggedFriendsRaw)
        taggedFriends = Array.isArray(parsed) ? parsed.map(String) : []
      } catch {
        taggedFriends = []
      }
    }

    const latitude = latitudeRaw ? Number(latitudeRaw) : null
    const longitude = longitudeRaw ? Number(longitudeRaw) : null

    const insertPayloadExtended = {
      id: memoryId,
      title,
      description,
      date,
      location: location || 'Unknown Location',
      image_url: imagePath,
      uploaded_by: uploadedBy,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      is_private: isPrivate,
      created_at: createdAt,
      series: series || null,
      tagged_friends: taggedFriends,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      aspect_ratio: aspectRatio,
      display_type: displayType,
      created_by_email: auth.user.email || null,
    }

    let insertError: { message: string } | null = null

    const extendedInsert = await supabase
      .from('memories')
      .insert(insertPayloadExtended)

    insertError = extendedInsert.error

    if (insertError?.message?.toLowerCase().includes('column')) {
      const legacyPayload = {
        id: memoryId,
        title,
        description,
        date,
        location: location || 'Unknown Location',
        image_url: imagePath,
        uploaded_by: uploadedBy,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        is_private: isPrivate,
        created_at: createdAt,
        series: series || null,
      }

      const legacyInsert = await supabase.from('memories').insert(legacyPayload)
      insertError = legacyInsert.error
    }

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to save memory: ${insertError.message}` },
        { status: 502 }
      )
    }

    const memory: Memory = {
      id: memoryId,
      title,
      description,
      date,
      location: location || 'Unknown Location',
      imagePath,
      uploadedBy,
      tags: insertPayloadExtended.tags,
      isPrivate,
      createdAt,
      series: series || undefined,
      taggedFriends,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      aspectRatio,
      displayType,
      createdByEmail: auth.user.email || null,
    }

    return NextResponse.json({ success: true, memory }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload memory' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    const supabase = createSupabaseServerClient(auth?.accessToken)

    const query = supabase
      .from('memories')
      .select('id, title, description, date, location, image_url, uploaded_by, tags, is_private, created_at, series, tagged_friends, latitude, longitude, aspect_ratio, display_type, created_by_email')
      .order('date', { ascending: false })

    let data: unknown[] | null = null
    let error: { message: string } | null = null

    const extendedQueryResult = auth?.user
      ? await query
      : await query.eq('is_private', false)

    data = extendedQueryResult.data as unknown[] | null
    error = extendedQueryResult.error

    if (error?.message?.toLowerCase().includes('column')) {
      const fallbackQuery = supabase
        .from('memories')
        .select('id, title, description, date, location, image_url, uploaded_by, tags, is_private, created_at, series')
        .order('date', { ascending: false })

      const fallbackResult = auth?.user
        ? await fallbackQuery
        : await fallbackQuery.eq('is_private', false)

      data = fallbackResult.data as unknown[] | null
      error = fallbackResult.error
    }

    if (error) {
      throw error
    }

    const memories = Array.isArray(data)
      ? data.map((row) => mapRowToMemory(row as Record<string, unknown>))
      : []

    if (!memories.length) {
      const { INITIAL_MEMORIES } = await import('@/lib/data')
      return NextResponse.json({ memories: INITIAL_MEMORIES })
    }

    return NextResponse.json({ memories })
  } catch {
    const { INITIAL_MEMORIES } = await import('@/lib/data')
    return NextResponse.json({ memories: INITIAL_MEMORIES })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth?.user || !auth.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const payload = (body && typeof body === 'object') ? (body as Record<string, unknown>) : {}
    const id = typeof payload.id === 'string' ? payload.id.trim() : ''

    if (!id) {
      return NextResponse.json({ error: 'Memory id is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient(auth.accessToken)

    const existing = await supabase
      .from('memories')
      .select('id, image_url')
      .eq('id', id)
      .maybeSingle()

    if (existing.error) {
      return NextResponse.json({ error: `Failed to load memory: ${existing.error.message}` }, { status: 502 })
    }

    if (!existing.data) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    const imageUrl = typeof existing.data.image_url === 'string' ? existing.data.image_url : ''
    const objectPath = extractStorageObjectPath(imageUrl)

    if (objectPath) {
      const storageDelete = await supabase.storage.from(MEMORY_BUCKET).remove([objectPath])
      if (storageDelete.error) {
        console.log('Storage delete warning:', storageDelete.error.message)
      }
    }

    const deleted = await supabase
      .from('memories')
      .delete()
      .eq('id', id)

    if (deleted.error) {
      return NextResponse.json({ error: `Failed to delete memory: ${deleted.error.message}` }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 })
  }
}
