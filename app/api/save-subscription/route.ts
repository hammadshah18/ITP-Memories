import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed, normalizeEmail } from '@/lib/access'

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(SUPABASE_AUTH_COOKIE)?.value
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const authClient = createSupabaseServerClient()
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)

    if (userError || !userData.user?.email || !isEmailAllowed(userData.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const subscription = body?.subscription
    const userEmailRaw = typeof body?.user_email === 'string' ? body.user_email : ''
    const userEmail = normalizeEmail(userEmailRaw)

    if (!subscription || !userEmail) {
      return NextResponse.json({ error: 'subscription and user_email are required' }, { status: 400 })
    }

    if (normalizeEmail(userData.user.email) !== userEmail) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
    }

    const supabase = createSupabaseServerClient(accessToken)
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_email: userEmail,
          subscription,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_email' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
