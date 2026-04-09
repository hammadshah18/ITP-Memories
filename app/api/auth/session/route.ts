import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed } from '@/lib/access'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(SUPABASE_AUTH_COOKIE)?.value
    if (!accessToken) {
      return NextResponse.json({ user: null }, { headers: NO_STORE_HEADERS })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser(accessToken)

    if (error || !data.user || !isEmailAllowed(data.user.email)) {
      const denied = NextResponse.json({ user: null }, { headers: NO_STORE_HEADERS })
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
    }, { headers: NO_STORE_HEADERS })
  } catch {
    return NextResponse.json({ user: null }, { headers: NO_STORE_HEADERS })
  }
}
