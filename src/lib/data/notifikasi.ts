import { createAdminClient } from '@/lib/supabase/admin'

type AdminClient = ReturnType<typeof createAdminClient>

export interface NotificationInput {
  pelangganId: string
  title: string
  message: string
  type?: string
  ticketId?: string | null
  scheduleId?: string | null
  scheduledAt?: string | null
}

export interface NotificationRow {
  id: string
  pelanggan_id: string
  title: string
  message: string
  type: string | null
  scheduled_at: string | null
  is_read: boolean
  created_at: string | null
}

function buildNotificationAttempts(inputs: NotificationInput[]) {
  const now = new Date().toISOString()

  return [
    inputs.map((item) => ({
      pelanggan_id: item.pelangganId,
      judul: item.title,
      pesan: item.message,
      tipe: item.type ?? 'info',
      tiket_id: item.ticketId ?? null,
      jadwal_layanan_id: item.scheduleId ?? null,
      tanggal_notifikasi: item.scheduledAt ?? now,
      is_read: false,
      created_at: now,
    })),
    inputs.map((item) => ({
      pelanggan_id: item.pelangganId,
      title: item.title,
      message: item.message,
      type: item.type ?? 'info',
      ticket_id: item.ticketId ?? null,
      jadwal_layanan_id: item.scheduleId ?? null,
      scheduled_at: item.scheduledAt ?? now,
      read: false,
      created_at: now,
    })),
    inputs.map((item) => ({
      pelanggan_id: item.pelangganId,
      judul: item.title,
      isi_notifikasi: item.message,
      tipe: item.type ?? 'info',
      tiket_id: item.ticketId ?? null,
      jadwal_layanan_id: item.scheduleId ?? null,
      tanggal_kirim: item.scheduledAt ?? now,
      dibaca: false,
      created_at: now,
    })),
    inputs.map((item) => ({
      pelanggan_id: item.pelangganId,
      judul: item.title,
      pesan: item.message,
      created_at: item.scheduledAt ?? now,
    })),
  ]
}

export async function createNotifications(inputs: NotificationInput[], admin: AdminClient = createAdminClient()) {
  if (inputs.length === 0) return

  const attempts = buildNotificationAttempts(inputs)
  let lastError: { message: string } | null = null

  for (const rows of attempts) {
    const { error } = await admin.from('notifikasi').insert(rows as any[])
    if (!error) return
    lastError = error
  }

  if (lastError) throw new Error(lastError.message)
}

export async function getNotifications(pelangganId: string): Promise<NotificationRow[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('notifikasi')
    .select('*')
    .eq('pelanggan_id', pelangganId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('getNotifications error:', error)
    return []
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,
    pelanggan_id: item.pelanggan_id,
    title: item.judul ?? item.title ?? 'Notifikasi',
    message: item.pesan ?? item.message ?? item.isi_notifikasi ?? '',
    type: item.tipe ?? item.type ?? null,
    scheduled_at: item.tanggal_notifikasi ?? item.scheduled_at ?? item.tanggal_kirim ?? item.created_at ?? null,
    is_read: Boolean(item.is_read ?? item.read ?? item.dibaca ?? false),
    created_at: item.created_at ?? null,
  }))
}

export async function markNotificationAsRead(notificationId: string, pelangganId: string) {
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const attempts = [
    { is_read: true, read_at: now },
    { dibaca: true, dibaca_pada: now },
    { read: true, read_at: now },
  ]

  let lastError: { message: string } | null = null

  for (const payload of attempts) {
    const { error } = await admin
      .from('notifikasi')
      .update(payload)
      .eq('id', notificationId)
      .eq('pelanggan_id', pelangganId)

    if (!error) return
    lastError = error
  }

  if (lastError) throw new Error(lastError.message)
}
