import { NextRequest, NextResponse } from 'next/server'
import webpush, { PushSubscription } from 'web-push'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { ALLOWED_EMAILS, isEmailAllowed, normalizeEmail } from '@/lib/access'

let vapidConfigured = false

function ensureVapidConfigured() {
  if (vapidConfigured) return

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL

  if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
    throw new Error('Missing VAPID environment variables')
  }

  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)
  vapidConfigured = true
}

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
    const title = typeof body?.title === 'string' ? body.title : ''
    const messageBody = typeof body?.body === 'string' ? body.body : ''
    const url = typeof body?.url === 'string' ? body.url : '/dashboard'
    const recipients = Array.isArray(body?.recipients)
      ? body.recipients.map((entry: unknown) => String(entry)).map(normalizeEmail)
      : ALLOWED_EMAILS.map((email) => normalizeEmail(email))

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
    }

    ensureVapidConfigured()

    const supabase = createSupabaseServerClient(accessToken)
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id, user_email, subscription')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const records = Array.isArray(data) ? data : []
    const targets = records.filter((entry) => {
      const email = normalizeEmail(String(entry.user_email ?? ''))
      return recipients.includes(email)
    })

    const payload = JSON.stringify({ title, body: messageBody, url })
    const sentTo: string[] = []

    for (const entry of targets) {
      try {
        await webpush.sendNotification(entry.subscription as PushSubscription, payload)
        sentTo.push(String(entry.user_email ?? ''))
      } catch (sendError: unknown) {
        const statusCode = typeof sendError === 'object' && sendError && 'statusCode' in sendError
          ? Number((sendError as { statusCode?: number }).statusCode)
          : 0

        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', entry.id)
        }
      }
    }

    return NextResponse.json({ success: true, count: sentTo.length, sentTo })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send notifications'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
