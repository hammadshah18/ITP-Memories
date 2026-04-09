import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, SUPABASE_AUTH_COOKIE } from '@/lib/supabase'
import { isEmailAllowed } from '@/lib/access'
import ProfileNotificationsClient from '@/components/ProfileNotificationsClient'

export default async function ProfileNotificationsPage() {
  const accessToken = cookies().get(SUPABASE_AUTH_COOKIE)?.value
  if (!accessToken) {
    redirect('/login')
  }

  const authClient = createSupabaseServerClient()
  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)

  if (userError || !userData.user || !isEmailAllowed(userData.user.email)) {
    redirect('/login')
  }

  return <ProfileNotificationsClient />
}
