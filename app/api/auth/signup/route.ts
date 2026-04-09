import { NextRequest, NextResponse } from 'next/server'
import { normalizeEmail } from '@/lib/access'

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

    return NextResponse.json({ error: `Signup is disabled. Use login with ${email}.` }, { status: 403 })
  } catch (error) {
    console.log(error)
    const message = error instanceof Error ? error.message : 'Signup is disabled'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
