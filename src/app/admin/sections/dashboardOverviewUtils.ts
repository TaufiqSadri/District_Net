import type { NewRegistrationRow } from '@/app/admin/sections/RegistrationTable'
import type { RecentActivityItem } from '@/app/admin/sections/RecentActivityCard'

export type PelangganBaru = {
  id: string
  nama_lengkap: string
  email: string
  status_langganan: string
  created_at: string
  paket_internet:
    | {
        nama_paket: string
        kecepatan_mbps: number
      }
    | {
        nama_paket: string
        kecepatan_mbps: number
      }[]
    | null
}

export type AmountRow = {
  jumlah_bayar?: number | null
  jumlah_tagihan?: number | null
  status_tagihan?: string | null
}

export type PaymentActivityRow = {
  id: string
  jumlah_bayar: number | null
  status_verifikasi: string | null
  created_at: string | null
  tanggal_pembayaran: string | null
  tagihan:
    | {
        bulan: number | null
        tahun: number | null
        pelanggan: { nama_lengkap: string | null } | { nama_lengkap: string | null }[] | null
      }
    | {
        bulan: number | null
        tahun: number | null
        pelanggan: { nama_lengkap: string | null } | { nama_lengkap: string | null }[] | null
      }[]
    | null
  tagihan_instalasi:
    | {
        pelanggan: { nama_lengkap: string | null } | { nama_lengkap: string | null }[] | null
      }
    | {
        pelanggan: { nama_lengkap: string | null } | { nama_lengkap: string | null }[] | null
      }[]
    | null
}

export type ScheduleActivityRow = {
  id: string
  status: string | null
  jenis_jadwal?: string | null
  created_at: string | null
  updated_at: string | null
  pelanggan: { nama_lengkap: string | null } | { nama_lengkap: string | null }[] | null
}

export type TicketActivityRow = {
  id: string
  nomor_tiket: string | null
  subjek: string | null
  status: string | null
  created_at: string | null
  pelanggan: { nama_lengkap: string | null } | { nama_lengkap: string | null }[] | null
}

type ActivityWithTimestamp = RecentActivityItem & {
  timestamp: number
}

export const customerStatusItems = [
  { key: 'aktif', label: 'Aktif', colorClass: 'bg-[#5427e6]' },
  { key: 'pending', label: 'Menunggu Aktivasi', colorClass: 'bg-[#f59e0b]' },
  { key: 'proses_instalasi', label: 'Proses Instalasi', colorClass: 'bg-[#3b82f6]' },
  { key: 'ditangguhkan', label: 'Ditangguhkan', colorClass: 'bg-[#c91d1d]' },
  { key: 'nonaktif', label: 'Nonaktif', colorClass: 'bg-slate-500' },
] as const

export function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export function sumRows(rows: AmountRow[], key: 'jumlah_bayar' | 'jumlah_tagihan') {
  return rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0)
}

export function formatDashboardDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatCompactRupiah(value: number, tight = false) {
  const prefix = tight ? 'Rp' : 'Rp '
  const absValue = Math.abs(value)

  if (absValue >= 1_000_000_000) {
    return `${prefix}${formatDecimal(value / 1_000_000_000)}B`
  }
  if (absValue >= 1_000_000) {
    return `${prefix}${formatDecimal(value / 1_000_000)}M`
  }
  if (absValue >= 1_000) {
    return `${prefix}${formatDecimal(value / 1_000)}k`
  }

  return `${prefix}${value.toLocaleString('id-ID')}`
}

export function formatPercentChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? '+100%' : '0%'

  const change = ((current - previous) / previous) * 100
  const rounded = Math.abs(change) >= 10 ? Math.round(change) : Number(change.toFixed(1))
  return `${change >= 0 ? '+' : ''}${rounded}%`
}

export function buildSignupBars(rows: Array<{ created_at: string }>) {
  const buckets = [0, 0, 0, 0]

  for (const row of rows) {
    const date = new Date(row.created_at)
    const index = Math.min(3, Math.max(0, Math.floor((date.getDate() - 1) / 7)))
    buckets[index] += 1
  }

  return buckets
}

export function mapRegistrations(rows: PelangganBaru[]): NewRegistrationRow[] {
  return rows.map((pelanggan) => {
    const paket = firstRelation(pelanggan.paket_internet)

    return {
      id: pelanggan.id,
      name: pelanggan.nama_lengkap,
      email: pelanggan.email,
      packageLabel: paket
        ? `${paket.nama_paket}\n${paket.kecepatan_mbps}Mbps`
        : 'Paket belum dipilih',
      status: pelanggan.status_langganan,
    }
  })
}

export function buildRecentActivities({
  payments,
  schedules,
  tickets,
  registrations,
  now,
}: {
  payments: PaymentActivityRow[]
  schedules: ScheduleActivityRow[]
  tickets: TicketActivityRow[]
  registrations: PelangganBaru[]
  now: Date
}) {
  const paymentItems = payments.map<ActivityWithTimestamp>((payment) => {
    const tagihan = firstRelation(payment.tagihan)
    const tagihanInstalasi = firstRelation(payment.tagihan_instalasi)
    const pelanggan =
      firstRelation(tagihan?.pelanggan)?.nama_lengkap ??
      firstRelation(tagihanInstalasi?.pelanggan)?.nama_lengkap ??
      'Pelanggan'
    const date = payment.created_at ?? payment.tanggal_pembayaran

    return {
      id: `payment-${payment.id}`,
      title: `${pelanggan} melakukan pembayaran`,
      meta: `${relativeTime(date, now)} - ${formatPaymentStatus(payment.status_verifikasi)}`,
      type: 'payment',
      timestamp: timestamp(date),
    }
  })

  const scheduleItems = schedules.map<ActivityWithTimestamp>((schedule) => {
    const pelanggan = firstRelation(schedule.pelanggan)?.nama_lengkap ?? 'pelanggan'
    const date = schedule.updated_at ?? schedule.created_at

    return {
      id: `schedule-${schedule.id}`,
      title: `Teknisi dijadwalkan ke ${pelanggan}`,
      meta: `${relativeTime(date, now)} - ${formatScheduleStatus(schedule.status)}`,
      type: 'schedule',
      timestamp: timestamp(date),
    }
  })

  const ticketItems = tickets.map<ActivityWithTimestamp>((ticket) => {
    const pelanggan = firstRelation(ticket.pelanggan)?.nama_lengkap ?? 'Pelanggan'
    const date = ticket.created_at

    return {
      id: `ticket-${ticket.id}`,
      title: `${pelanggan} membuat tiket layanan`,
      meta: `${relativeTime(date, now)} - ${ticket.status === 'closed' ? 'Closed' : 'Open'}`,
      type: 'ticket',
      timestamp: timestamp(date),
    }
  })

  const registrationItems = registrations.map<ActivityWithTimestamp>((registration) => {
    const paket = firstRelation(registration.paket_internet)

    return {
      id: `registration-${registration.id}`,
      title: `${registration.nama_lengkap} mendaftar paket`,
      meta: `${relativeTime(registration.created_at, now)} - ${
        paket ? `${paket.nama_paket} ${paket.kecepatan_mbps}Mbps` : 'Paket belum dipilih'
      }`,
      type: 'registration',
      timestamp: timestamp(registration.created_at),
    }
  })

  return [...paymentItems, ...scheduleItems, ...ticketItems, ...registrationItems]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4)
    .map(({ timestamp: _timestamp, ...item }) => item)
}

function formatDecimal(value: number) {
  const precision = Math.abs(value) >= 10 ? 0 : 1
  return value.toFixed(precision).replace(/\.0$/, '')
}

function relativeTime(value: string | null | undefined, now: Date) {
  if (!value) return 'baru saja'

  const diffMs = Math.max(0, now.getTime() - new Date(value).getTime())
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes} menit yang lalu`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam yang lalu`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari yang lalu`

  const months = Math.floor(days / 30)
  return `${months} bulan yang lalu`
}

function timestamp(value: string | null | undefined) {
  if (!value) return 0
  return new Date(value).getTime()
}

function formatPaymentStatus(status: string | null) {
  if (status === 'diterima') return 'Pembayaran diterima'
  if (status === 'ditolak') return 'Pembayaran ditolak'
  return 'Menunggu verifikasi'
}

function formatScheduleStatus(status: string | null) {
  if (status === 'terjadwal') return 'Terjadwal'
  if (status === 'dikerjakan') return 'Sedang dikerjakan'
  if (status === 'selesai') return 'Selesai'
  if (status === 'dibatalkan') return 'Dibatalkan'
  return 'Menunggu jadwal'
}
