interface SubscribePushOptions {
  userEmail: string
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from(rawData.split('').map((char) => char.charCodeAt(0)))
}

export async function subscribePush({ userEmail }: SubscribePushOptions) {
  if (typeof window === 'undefined') return { ok: false, reason: 'server' }
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' }
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidPublicKey) {
    return { ok: false, reason: 'missing-vapid-key' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { ok: false, reason: 'permission-denied' }
  }

  let registration: ServiceWorkerRegistration
  try {
    registration = await navigator.serviceWorker.ready
  } catch {
    try {
      registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
    } catch {
      return { ok: false, reason: 'sw-register-failed' }
    }
  }

  const existing = await registration.pushManager.getSubscription()
  const subscription = existing || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })

  const res = await fetch('/api/save-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription, user_email: userEmail }),
  })

  if (!res.ok) {
    return { ok: false, reason: 'save-failed' }
  }

  return { ok: true }
}
