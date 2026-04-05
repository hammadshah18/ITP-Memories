import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_AUTH_COOKIE } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    await request.text()
    const response = NextResponse.json({ error: 'Signup is disabled. Please contact admin.' }, { status: 403 })
    response.cookies.set(SUPABASE_AUTH_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    })
    return response
  } catch (error) {
    console.log(error)
    const message = error instanceof Error ? error.message : 'Failed to sign up'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
