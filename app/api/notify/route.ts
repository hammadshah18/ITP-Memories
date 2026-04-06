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

async function sendEmailNotifications(options: {
  recipients: string[]
  title: string
  body: string
  url: string
}) {
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itp-memories.vercel.app'

  if (!resendApiKey || !fromEmail || options.recipients.length === 0) {
    return { attempted: false, sentTo: [] as string[] }
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 16px; color: #111827;">
      <h2 style="margin: 0 0 12px;">${options.title}</h2>
      <p style="margin: 0 0 16px; line-height: 1.5;">${options.body}</p>
      <a href="${appUrl}${options.url}" style="display: inline-block; padding: 10px 14px; border-radius: 999px; background: #486648; color: #ffffff; text-decoration: none; font-weight: 700;">
        Open ITP Memories
      </a>
    </div>
  `

  const sentTo: string[] = []

  for (const recipient of options.recipients) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [recipient],
          subject: options.title,
          html: emailHtml,
        }),
      })

      if (response.ok) {
        sentTo.push(recipient)
      }
    } catch {
      // Keep push flow resilient even if email send fails.
    }
  }

  return { attempted: true, sentTo }
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

    const emailResult = await sendEmailNotifications({
      recipients,
      title,
      body: messageBody,
      url,
    })

    return NextResponse.json({
      success: true,
      count: sentTo.length,
      sentTo,
      emailAttempted: emailResult.attempted,
      emailCount: emailResult.sentTo.length,
      emailSentTo: emailResult.sentTo,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send notifications'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
