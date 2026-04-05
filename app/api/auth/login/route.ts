import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed, normalizeEmail } from '@/lib/access'

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      console.log(error)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const payload = (body && typeof body === 'object') ? (body as Record<string, unknown>) : {}
    const email = typeof payload.email === 'string' ? normalizeEmail(payload.email) : ''
    const password = typeof payload.password === 'string' ? payload.password : ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session || !data.user) {
      console.log(error)
      return NextResponse.json({ error: error?.message ?? 'Invalid credentials' }, { status: 401 })
    }

    if (!isEmailAllowed(data.user.email)) {
      const deniedResponse = NextResponse.json({ error: 'Access denied' }, { status: 403 })
      deniedResponse.cookies.set(SUPABASE_AUTH_COOKIE, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
      })
      return deniedResponse
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })

    response.cookies.set(SUPABASE_AUTH_COOKIE, data.session.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: data.session.expires_in ?? 60 * 60,
    })

    return response
  } catch (error) {
    console.log(error)
    const message = error instanceof Error ? error.message : 'Failed to login'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
