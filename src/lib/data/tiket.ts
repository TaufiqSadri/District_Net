import { createAdminClient } from '@/lib/supabase/admin'
import { createNotifications } from '@/lib/data/notifikasi'
import type { Pelanggan } from '@/types/database'

type AdminClient = ReturnType<typeof createAdminClient>

export type TicketStatus = 'open' | 'closed'
export type TicketSenderType = 'pelanggan' | 'admin' | 'system'
export type ServiceScheduleType = 'instalasi' | 'pengecekan' | 'perbaikan'
export type ServiceScheduleStatus =
  | 'menunggu_jadwal'
  | 'terjadwal'
  | 'dikerjakan'
  | 'selesai'
  | 'dibatalkan'

export interface TicketMessage {
  id: string
  tiket_id: string
  sender_type: TicketSenderType
  sender_id: string | null
  pesan: string
  created_at: string
}

export interface TicketRow {
  id: string
  pelanggan_id: string
  nomor_tiket: string
  subjek: string
  status: TicketStatus
  closed_at: string | null
  created_at: string
  updated_at?: string | null
}

export type TicketCustomer = Pick<
  Pelanggan,
  'id' | 'user_id' | 'nama_lengkap' | 'email' | 'no_hp' | 'alamat_pemasangan'
>

export type TicketWithCustomer = TicketRow & {
  pelanggan: TicketCustomer | null
}

export type TicketListItem = TicketWithCustomer & {
  latestMessage: TicketMessage | null
  messageCount: number
}

export type TicketDetail = TicketWithCustomer & {
  messages: TicketMessage[]
}

export interface TicketListResult {
  data: TicketListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface TicketStats {
  total: number
  open: number
  closed: number
}

export interface ScheduleTicketServiceInput {
  tiket_id: string
  jenis_jadwal: 'pengecekan' | 'perbaikan'
  tanggal_jadwal: string
  teknisi?: string | null
  catatan_pelanggan?: string | null
  catatan_internal?: string | null
}

const CLOSED_TICKET_MESSAGE =
  'Tiket ini sudah ditutup. Silakan buat tiket baru jika Anda masih mengalami kendala.'

const ticketSelect = `
  *,
  pelanggan:pelanggan_id (
    id,
    user_id,
    nama_lengkap,
    email,
    no_hp,
    alamat_pemasangan
  )
`

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function normalizeTicket(row: any): TicketWithCustomer {
  return {
    ...row,
    pelanggan: firstRelation(row.pelanggan),
  } as TicketWithCustomer
}

function generateNomorTiket() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TKT-${date}-${suffix}`
}

function sanitizeSearch(value: string) {
  return value.trim().replace(/[(),]/g, ' ')
}

function formatTicketDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function addDays(value: string, days: number) {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function buildSystemScheduleMessage(jenisJadwal: 'pengecekan' | 'perbaikan', tanggalJadwal: string) {
  return `Admin menjadwalkan ${jenisJadwal} pada ${formatTicketDateTime(tanggalJadwal)}. Mohon pastikan pemilik berada di rumah.`
}

async function attachMessageMeta(tickets: TicketWithCustomer[], admin: AdminClient): Promise<TicketListItem[]> {
  if (tickets.length === 0) return []

  const ticketIds = tickets.map((ticket) => ticket.id)
  const { data: messages, error } = await admin
    .from('tiket_pesan')
    .select('id, tiket_id, sender_type, sender_id, pesan, created_at')
    .in('tiket_id', ticketIds)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('attachMessageMeta error:', error)
    return tickets.map((ticket) => ({ ...ticket, latestMessage: null, messageCount: 0 }))
  }

  const latestByTicket = new Map<string, TicketMessage>()
  const countByTicket = new Map<string, number>()

  for (const message of (messages ?? []) as TicketMessage[]) {
    countByTicket.set(message.tiket_id, (countByTicket.get(message.tiket_id) ?? 0) + 1)
    if (!latestByTicket.has(message.tiket_id)) latestByTicket.set(message.tiket_id, message)
  }

  return tickets.map((ticket) => ({
    ...ticket,
    latestMessage: latestByTicket.get(ticket.id) ?? null,
    messageCount: countByTicket.get(ticket.id) ?? 0,
  }))
}

export async function createTicket({
  pelanggan_id,
  subjek,
  pesan_awal,
}: {
  pelanggan_id: string
  subjek: string
  pesan_awal: string
}): Promise<TicketWithCustomer> {
  const admin = createAdminClient()
  const subject = subjek.trim()
  const message = pesan_awal.trim()

  if (subject.length < 3) throw new Error('Subjek tiket minimal 3 karakter.')
  if (message.length < 10) throw new Error('Pesan awal minimal 10 karakter.')

  const { data: ticket, error: ticketError } = await admin
    .from('tiket_layanan')
    .insert({
      pelanggan_id,
      nomor_tiket: generateNomorTiket(),
      subjek: subject,
      status: 'open',
    })
    .select(ticketSelect)
    .single()

  if (ticketError) throw new Error(ticketError.message)

  const { error: messageError } = await admin.from('tiket_pesan').insert({
    tiket_id: ticket.id,
    sender_type: 'pelanggan',
    sender_id: pelanggan_id,
    pesan: message,
  })

  if (messageError) throw new Error(messageError.message)

  return normalizeTicket(ticket)
}

export async function getCustomerTickets({
  pelangganId,
  page = 1,
  pageSize = 10,
}: {
  pelangganId: string
  page?: number
  pageSize?: number
}): Promise<TicketListResult> {
  const admin = createAdminClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await admin
    .from('tiket_layanan')
    .select(ticketSelect, { count: 'exact' })
    .eq('pelanggan_id', pelangganId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getCustomerTickets error:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const tickets = await attachMessageMeta((data ?? []).map(normalizeTicket), admin)
  const total = count ?? 0

  return {
    data: tickets,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getAdminTickets({
  search = '',
  status = 'semua',
  pelangganId,
  page = 1,
  pageSize = 10,
}: {
  search?: string
  status?: TicketStatus | 'semua'
  pelangganId?: string
  page?: number
  pageSize?: number
} = {}): Promise<TicketListResult> {
  const admin = createAdminClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const searchTerm = sanitizeSearch(search)

  let pelangganIds: string[] = pelangganId ? [pelangganId] : []

  if (!pelangganId && searchTerm) {
    const { data: pelanggan } = await admin
      .from('pelanggan')
      .select('id')
      .or(`nama_lengkap.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,no_hp.ilike.%${searchTerm}%`)

    pelangganIds = (pelanggan ?? []).map((item: { id: string }) => item.id)
  }

  let query = admin
    .from('tiket_layanan')
    .select(ticketSelect, { count: 'exact' })

  if (status !== 'semua') query = query.eq('status', status)
  if (pelangganId) query = query.eq('pelanggan_id', pelangganId)

  if (searchTerm && !pelangganId) {
    const parts = [
      `nomor_tiket.ilike.%${searchTerm}%`,
      `subjek.ilike.%${searchTerm}%`,
    ]
    if (pelangganIds.length > 0) parts.push(`pelanggan_id.in.(${pelangganIds.join(',')})`)
    query = query.or(parts.join(','))
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('getAdminTickets error:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const tickets = await attachMessageMeta((data ?? []).map(normalizeTicket), admin)
  const total = count ?? 0

  return {
    data: tickets,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getTicketDetail(tiketId: string, pelangganId?: string): Promise<TicketDetail | null> {
  const admin = createAdminClient()
  let query = admin.from('tiket_layanan').select(ticketSelect).eq('id', tiketId)
  if (pelangganId) query = query.eq('pelanggan_id', pelangganId)

  const { data: ticket, error: ticketError } = await query.maybeSingle()

  if (ticketError) {
    console.error('getTicketDetail ticket error:', ticketError)
    return null
  }
  if (!ticket) return null

  const { data: messages, error: messageError } = await admin
    .from('tiket_pesan')
    .select('*')
    .eq('tiket_id', tiketId)
    .order('created_at', { ascending: true })

  if (messageError) {
    console.error('getTicketDetail message error:', messageError)
    return null
  }

  return {
    ...normalizeTicket(ticket),
    messages: (messages ?? []) as TicketMessage[],
  }
}

export async function sendTicketMessage({
  tiket_id,
  sender_type,
  sender_id,
  pesan,
}: {
  tiket_id: string
  sender_type: TicketSenderType
  sender_id?: string | null
  pesan: string
}) {
  const admin = createAdminClient()
  const message = pesan.trim()
  if (message.length < 1) throw new Error('Pesan tidak boleh kosong.')

  const { data: ticket, error: ticketError } = await admin
    .from('tiket_layanan')
    .select('id, status')
    .eq('id', tiket_id)
    .single()

  if (ticketError || !ticket) throw new Error(ticketError?.message ?? 'Tiket tidak ditemukan.')
  if (ticket.status !== 'open') throw new Error(CLOSED_TICKET_MESSAGE)

  const { data, error } = await admin
    .from('tiket_pesan')
    .insert({
      tiket_id,
      sender_type,
      sender_id: sender_id ?? null,
      pesan: message,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as TicketMessage
}

export async function closeTicket(tiket_id: string) {
  const admin = createAdminClient()

  const { data: ticket, error: ticketError } = await admin
    .from('tiket_layanan')
    .select('id, status')
    .eq('id', tiket_id)
    .single()

  if (ticketError || !ticket) throw new Error(ticketError?.message ?? 'Tiket tidak ditemukan.')
  if (ticket.status === 'closed') return

  const { error: updateError } = await admin
    .from('tiket_layanan')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
    })
    .eq('id', tiket_id)

  if (updateError) throw new Error(updateError.message)

  const { error: messageError } = await admin.from('tiket_pesan').insert({
    tiket_id,
    sender_type: 'system',
    sender_id: null,
    pesan: 'Tiket ini telah ditutup oleh admin.',
  })

  if (messageError) throw new Error(messageError.message)
}

export async function scheduleTicketService(input: ScheduleTicketServiceInput) {
  const admin = createAdminClient()
  const ticket = await getTicketDetail(input.tiket_id)

  if (!ticket) throw new Error('Tiket tidak ditemukan.')
  if (ticket.status !== 'open') throw new Error(CLOSED_TICKET_MESSAGE)
  if (input.jenis_jadwal !== 'pengecekan' && input.jenis_jadwal !== 'perbaikan') {
    throw new Error('Jenis jadwal harus pengecekan atau perbaikan.')
  }

  const tanggalJadwal = new Date(input.tanggal_jadwal)
  if (Number.isNaN(tanggalJadwal.getTime())) throw new Error('Tanggal jadwal tidak valid.')

  const { data: jadwal, error: scheduleError } = await admin
    .from('jadwal_layanan')
    .insert({
      pelanggan_id: ticket.pelanggan_id,
      tiket_id: ticket.id,
      jenis_jadwal: input.jenis_jadwal,
      tanggal_jadwal: tanggalJadwal.toISOString(),
      teknisi: input.teknisi?.trim() || null,
      status: 'terjadwal',
      catatan_pelanggan: input.catatan_pelanggan?.trim() || null,
      catatan_internal: input.catatan_internal?.trim() || null,
    })
    .select('id')
    .single()

  if (scheduleError) throw new Error(scheduleError.message)

  const message = buildSystemScheduleMessage(input.jenis_jadwal, tanggalJadwal.toISOString())

  const { error: messageError } = await admin.from('tiket_pesan').insert({
    tiket_id: ticket.id,
    sender_type: 'system',
    sender_id: null,
    pesan: message,
  })

  if (messageError) throw new Error(messageError.message)

  const jenisLabel = input.jenis_jadwal === 'pengecekan' ? 'pengecekan' : 'perbaikan'
  const formattedDate = formatTicketDateTime(tanggalJadwal.toISOString())
  const notificationMessage = `Jadwal ${jenisLabel} untuk tiket ${ticket.nomor_tiket} ditetapkan pada ${formattedDate}.`
  const recipientUserId = ticket.pelanggan?.user_id

  if (!recipientUserId) throw new Error('Akun pelanggan untuk notifikasi tidak ditemukan.')

  const now = new Date()
  const nowIso = now.toISOString()
  const scheduledIso = tanggalJadwal.toISOString()
  const notifications = [
    {
      userId: recipientUserId,
      title: `Jadwal ${jenisLabel} dibuat`,
      message: notificationMessage,
      type: 'jadwal',
      ticketId: ticket.id,
      scheduleId: jadwal.id,
      scheduledAt: nowIso,
    },
  ]

  const reminderNotifications = [
    {
      title: `Pengingat H-3 jadwal ${jenisLabel}`,
      scheduledAt: addDays(scheduledIso, -3),
    },
    {
      title: `Pengingat H-1 jadwal ${jenisLabel}`,
      scheduledAt: addDays(scheduledIso, -1),
    },
    {
      title: `Pengingat Hari-H jadwal ${jenisLabel}`,
      scheduledAt: scheduledIso,
    },
  ]

  for (const reminder of reminderNotifications) {
    if (new Date(reminder.scheduledAt).getTime() < now.getTime()) continue

    notifications.push({
      userId: recipientUserId,
      title: reminder.title,
      message: notificationMessage,
      type: 'jadwal',
      ticketId: ticket.id,
      scheduleId: jadwal.id,
      scheduledAt: reminder.scheduledAt,
    })
  }

  await createNotifications(
    notifications,
    admin,
  )

  return jadwal
}

export async function getTicketStats(): Promise<TicketStats> {
  const admin = createAdminClient()

  const [total, open, closed] = await Promise.all([
    admin.from('tiket_layanan').select('*', { count: 'exact', head: true }),
    admin.from('tiket_layanan').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('tiket_layanan').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
  ])

  return {
    total: total.count ?? 0,
    open: open.count ?? 0,
    closed: closed.count ?? 0,
  }
}

export { CLOSED_TICKET_MESSAGE }
