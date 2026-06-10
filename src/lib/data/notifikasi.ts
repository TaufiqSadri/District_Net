import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type AdminClient = ReturnType<typeof createAdminClient>

export interface NotificationInput {
  userId: string
  title: string
  message: string
  type?: string
  ticketId?: string | null
  scheduleId?: string | null
  relatedId?: string | null
  scheduledAt?: string | null
}

export interface NotificationRow {
  id: string
  user_id: string
  title: string
  message: string
  type: string | null
  related_id: string | null
  scheduled_at: string | null
  is_read: boolean
  created_at: string | null
}

async function getCurrentUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id ?? null
}

function buildNotificationRows(inputs: NotificationInput[]) {
  const now = new Date().toISOString()

  return inputs.map((item) => ({
    user_id: item.userId,
    judul: item.title,
    isi: item.message,
    tipe: item.type ?? 'info',
    related_id: item.relatedId ?? item.scheduleId ?? item.ticketId ?? null,
    scheduled_at: item.scheduledAt ?? now,
    is_read: false,
    created_at: now,
  }))
}

export async function createNotifications(inputs: NotificationInput[], admin: AdminClient = createAdminClient()) {
  if (inputs.length === 0) return

  const { error } = await admin.from('notifikasi').insert(buildNotificationRows(inputs) as any[])

  if (error) throw new Error(error.message)
}

export async function getNotificationsForUser(
  userId: string,
  admin: AdminClient = createAdminClient(),
): Promise<NotificationRow[]> {
  const now = new Date().toISOString()
  const { data, error } = await admin
    .from('notifikasi')
    .select('*')
    .eq('user_id', userId)
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('getNotifications error:', error)
    return []
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    title: item.judul ?? item.title ?? 'Notifikasi',
    message: item.isi ?? item.pesan ?? item.message ?? '',
    type: item.tipe ?? item.type ?? null,
    related_id: item.related_id ?? null,
    scheduled_at: item.scheduled_at ?? item.created_at ?? null,
    is_read: Boolean(item.is_read ?? false),
    created_at: item.created_at ?? null,
  }))
}

export async function getNotifications(): Promise<NotificationRow[]> {
  const userId = await getCurrentUserId()
  if (!userId) return []

  return getNotificationsForUser(userId)
}

export async function getUnreadNotificationCountForUser(
  userId: string,
  admin: AdminClient = createAdminClient(),
) {
  if (!userId) return 0

  const now = new Date().toISOString()
  const { count, error } = await admin
    .from('notifikasi')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('scheduled_at', now)
    .eq('is_read', false)

  if (error) {
    console.error('getUnreadNotificationCount error:', error)
    return 0
  }

  return count ?? 0
}

export async function getUnreadNotificationCount() {
  const userId = await getCurrentUserId()
  if (!userId) return 0

  return getUnreadNotificationCountForUser(userId)
}

export async function markNotificationAsRead(notificationId: string) {
  const userId = await getCurrentUserId()
  if (!userId) return

  const admin = createAdminClient()
  const { error } = await admin
    .from('notifikasi')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}
