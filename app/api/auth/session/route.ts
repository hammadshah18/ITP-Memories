import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed } from '@/lib/access'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(SUPABASE_AUTH_COOKIE)?.value
    if (!accessToken) {
      return NextResponse.json({ user: null })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser(accessToken)

    if (error || !data.user || !isEmailAllowed(data.user.email)) {
      const denied = NextResponse.json({ user: null })
      denied.cookies.set(SUPABASE_AUTH_COOKIE, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
      })
      return denied
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
