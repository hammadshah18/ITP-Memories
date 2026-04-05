import { NextResponse } from 'next/server'
import { SUPABASE_AUTH_COOKIE } from '@/lib/supabase'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(SUPABASE_AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })

  return response
}
