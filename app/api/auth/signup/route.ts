import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailSignupAllowed, normalizeEmail } from '@/lib/access'

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

    if (!isEmailSignupAllowed(email)) {
      return NextResponse.json({ error: 'Signup is restricted to approved emails only.' }, { status: 403 })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message ?? 'Signup failed' }, { status: 400 })
    }

    const response = NextResponse.json({
      success: true,
      requiresEmailConfirmation: !data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })

    if (data.session?.access_token) {
      response.cookies.set(SUPABASE_AUTH_COOKIE, data.session.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: data.session.expires_in ?? 60 * 60,
      })
    }

    return response
  } catch (error) {
    console.log(error)
    const message = error instanceof Error ? error.message : 'Failed to sign up'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
