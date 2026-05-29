import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  CreditCard,
  Receipt,
  UserPlus,
  Users,
  Wifi,
  Wrench,
} from 'lucide-react'
import StatCard from '@/components/admin/dashboard/StatCard'
import StatusDistributionCard from '@/components/admin/dashboard/StatusDistributionCard'
import BillingStatusCard from '@/components/admin/dashboard/BillingStatusCard'
import InstallationActivityCard from '@/components/admin/dashboard/InstallationActivityCard'
import ComplaintStatsCard from '@/components/admin/dashboard/ComplaintStatsCard'
import RegistrationTable, {
  type NewRegistrationRow,
} from '@/components/admin/dashboard/RegistrationTable'
import RecentActivityCard, {
  type RecentActivityItem,
} from '@/components/admin/dashboard/RecentActivityCard'
import { createAdminClient } from '@/lib/supabase/admin'
import { getKomplainStats } from '@/lib/data/komplain'
import { syncSuspendedPelangganStatuses } from '@/lib/data/pelangganStatus'

type PelangganBaru = {
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

type AmountRow = {
  jumlah_bayar?: number | null
  jumlah_tagihan?: number | null
  status_tagihan?: string | null
}

type PaymentActivityRow = {
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

type ScheduleActivityRow = {
  id: string
  status: string | null
  created_at: string | null
  updated_at: string | null
  pelanggan: { nama_lengkap: string | null } | { nama_lengkap: string | null }[] | null
}

type ComplaintActivityRow = {
  id: string
  isi_komplain: string | null
  status: boolean | null
  created_at: string | null
  tanggal: string | null
  pelanggan: { nama_lengkap: string | null } | { nama_lengkap: string | null }[] | null
}

type ActivityWithTimestamp = RecentActivityItem & {
  timestamp: number
}

const customerStatusItems = [
  { key: 'aktif', label: 'Aktif', colorClass: 'bg-[#5427e6]' },
  { key: 'pending', label: 'Menunggu Aktivasi', colorClass: 'bg-[#f59e0b]' },
  { key: 'proses_instalasi', label: 'Proses Instalasi', colorClass: 'bg-[#3b82f6]' },
  { key: 'ditangguhkan', label: 'Ditangguhkan', colorClass: 'bg-[#c91d1d]' },
  { key: 'nonaktif', label: 'Nonaktif', colorClass: 'bg-slate-500' },
] as const

export default async function AdminDashboardPage() {
  await syncSuspendedPelangganStatuses()
  const admin = createAdminClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalResult,
    activeResult,
    pendingResult,
    suspendedResult,
    installingResult,
    inactiveResult,
    { data: pelangganBaru },
    { data: revenueThisMonth },
    { data: revenuePreviousMonth },
    { data: tagihanRows },
    { data: tagihanInstalasiRows },
    { data: signupsThisMonth },
    komplainStats,
    { data: paymentActivities },
    { data: scheduleActivities },
    { data: complaintActivities },
  ] = await Promise.all([
    admin.from('pelanggan').select('*', { count: 'exact', head: true }),
    admin.from('pelanggan').select('*', { count: 'exact', head: true }).eq('status_langganan', 'aktif'),
    admin.from('pelanggan').select('*', { count: 'exact', head: true }).eq('status_langganan', 'pending'),
    admin.from('pelanggan').select('*', { count: 'exact', head: true }).eq('status_langganan', 'ditangguhkan'),
    admin.from('pelanggan').select('*', { count: 'exact', head: true }).eq('status_langganan', 'proses_instalasi'),
    admin.from('pelanggan').select('*', { count: 'exact', head: true }).eq('status_langganan', 'nonaktif'),
    admin
      .from('pelanggan')
      .select('id, nama_lengkap, email, status_langganan, created_at, paket_internet(nama_paket, kecepatan_mbps)')
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('pembayaran')
      .select('jumlah_bayar')
      .eq('status_verifikasi', 'diterima')
      .gte('tanggal_pembayaran', monthStart.toISOString())
      .lt('tanggal_pembayaran', nextMonthStart.toISOString()),
    admin
      .from('pembayaran')
      .select('jumlah_bayar')
      .eq('status_verifikasi', 'diterima')
      .gte('tanggal_pembayaran', previousMonthStart.toISOString())
      .lt('tanggal_pembayaran', monthStart.toISOString()),
    admin.from('tagihan').select('jumlah_tagihan, status_tagihan'),
    admin.from('tagihan_instalasi').select('jumlah_tagihan, status_tagihan'),
    admin
      .from('pelanggan')
      .select('created_at')
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', nextMonthStart.toISOString()),
    getKomplainStats(),
    admin
      .from('pembayaran')
      .select(
        `
        id,
        jumlah_bayar,
        status_verifikasi,
        created_at,
        tanggal_pembayaran,
        tagihan:tagihan_id (
          bulan,
          tahun,
          pelanggan:pelanggan_id ( nama_lengkap )
        ),
        tagihan_instalasi:tagihan_instalasi_id (
          pelanggan:pelanggan_id ( nama_lengkap )
        )
      `,
      )
      .order('created_at', { ascending: false })
      .limit(4),
    admin
      .from('jadwal_instalasi')
      .select('id, status, created_at, updated_at, pelanggan:pelanggan_id ( nama_lengkap )')
      .order('created_at', { ascending: false })
      .limit(3),
    admin
      .from('komplain')
      .select('id, isi_komplain, status, created_at, tanggal, pelanggan:pelanggan_id ( nama_lengkap )')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const totalPelanggan = totalResult.count ?? 0
  const pelangganAktif = activeResult.count ?? 0
  const pelangganPending = pendingResult.count ?? 0
  const pelangganDitangguhkan = suspendedResult.count ?? 0
  const pelangganProsesInstalasi = installingResult.count ?? 0
  const pelangganNonaktif = inactiveResult.count ?? 0
  const signups = (signupsThisMonth ?? []) as Array<{ created_at: string }>
  const newSignupsThisMonth = signups.length

  const allBillingRows = [
    ...(((tagihanRows ?? []) as AmountRow[]) ?? []),
    ...(((tagihanInstalasiRows ?? []) as AmountRow[]) ?? []),
  ]
  const billingTotals = allBillingRows.reduce(
    (acc, row) => {
      const amount = Number(row.jumlah_tagihan ?? 0)
      if (row.status_tagihan === 'lunas') acc.paid += amount
      if (row.status_tagihan === 'menunggu_verifikasi') acc.waiting += amount
      if (row.status_tagihan === 'belum_bayar') acc.unpaid += amount
      return acc
    },
    { paid: 0, waiting: 0, unpaid: 0 },
  )
  const billingTotalAmount = billingTotals.paid + billingTotals.waiting + billingTotals.unpaid
  const paidPercent =
    billingTotalAmount > 0 ? Math.round((billingTotals.paid / billingTotalAmount) * 100) : 0
  const unpaidBills = allBillingRows.filter((row) => row.status_tagihan === 'belum_bayar')

  const currentRevenue = sumRows((revenueThisMonth ?? []) as AmountRow[], 'jumlah_bayar')
  const previousRevenue = sumRows((revenuePreviousMonth ?? []) as AmountRow[], 'jumlah_bayar')
  const revenueChange = formatPercentChange(currentRevenue, previousRevenue)
  const activeRate = totalPelanggan > 0 ? Math.round((pelangganAktif / totalPelanggan) * 100) : 0

  const registrations = ((pelangganBaru ?? []) as PelangganBaru[]).map<NewRegistrationRow>((pelanggan) => {
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

  const activities = buildRecentActivities({
    payments: (paymentActivities ?? []) as PaymentActivityRow[],
    schedules: (scheduleActivities ?? []) as ScheduleActivityRow[],
    complaints: (complaintActivities ?? []) as ComplaintActivityRow[],
    registrations: (pelangganBaru ?? []) as PelangganBaru[],
    now,
  })

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-[15px] font-medium text-slate-500">
            {formatDashboardDate(now)}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
          <QuickAction href="/admin/pelanggan/createPelanggan" icon={<UserPlus size={18} />}>
            Tambah Pelanggan
          </QuickAction>
          <QuickAction href="/admin/tagihan/generate" icon={<Receipt size={18} />}>
            Buat Tagihan
          </QuickAction>
          <QuickAction href="/admin/jadwal-instalasi" icon={<Wrench size={18} />}>
            Jadwal Instalasi
          </QuickAction>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Pelanggan"
          value={totalPelanggan}
          href="/admin/pelanggan"
          icon={<Users size={23} className="text-[#5427e6]" />}
          iconBgClass="bg-violet-100"
          badge={{
            label: `+${newSignupsThisMonth}`,
            className: 'bg-emerald-100 text-emerald-600',
          }}
        />
        <StatCard
          label="Pelanggan Aktif"
          value={pelangganAktif}
          href="/admin/pelanggan?status=aktif"
          icon={<Wifi size={23} className="text-blue-600" />}
          iconBgClass="bg-blue-100"
          badge={{
            label: `${activeRate}% aktif`,
            className: 'bg-blue-100 text-blue-600',
          }}
        />
        <StatCard
          label="Pendapatan Bulan Ini"
          value={formatCompactRupiah(currentRevenue, true)}
          href="/admin/laporan"
          icon={<CreditCard size={24} className="text-emerald-500" />}
          iconBgClass="bg-emerald-100"
          badge={{
            label: revenueChange,
            className: revenueChange.startsWith('-')
              ? 'bg-red-100 text-red-600'
              : 'bg-emerald-100 text-emerald-600',
          }}
        />
        <StatCard
          label="Tagihan Tertunggak"
          value={unpaidBills.length}
          href="/admin/tagihan?status=belum_bayar"
          icon={<AlertTriangle size={24} className="text-red-600" />}
          iconBgClass="bg-red-100"
          helper={`(${formatCompactRupiah(billingTotals.unpaid)})`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)]">
        <StatusDistributionCard
          items={customerStatusItems.map((item) => ({
            label: item.label,
            colorClass: item.colorClass,
            value:
              item.key === 'aktif'
                ? pelangganAktif
                : item.key === 'pending'
                ? pelangganPending
                : item.key === 'proses_instalasi'
                ? pelangganProsesInstalasi
                : item.key === 'ditangguhkan'
                ? pelangganDitangguhkan
                : pelangganNonaktif,
          }))}
        />
        <BillingStatusCard
          paidAmount={billingTotals.paid}
          waitingAmount={billingTotals.waiting}
          unpaidAmount={billingTotals.unpaid}
          paidPercent={paidPercent}
          formatCurrency={(value) => formatCompactRupiah(value)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InstallationActivityCard
          newSignups={newSignupsThisMonth}
          bars={buildSignupBars(signups)}
        />
        <ComplaintStatsCard
          resolved={komplainStats.selesai}
          unresolved={komplainStats.menunggu}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(320px,1fr)]">
        <RegistrationTable rows={registrations} />
        <RecentActivityCard items={activities} />
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  children,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center gap-3 rounded-[14px] border border-[#dfe5ef] bg-white px-5 text-sm font-semibold text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:border-brand-purple/30 hover:text-brand-purple"
    >
      <span className="text-[#5427e6]">{icon}</span>
      <span className="whitespace-nowrap">{children}</span>
    </Link>
  )
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function sumRows(rows: AmountRow[], key: 'jumlah_bayar' | 'jumlah_tagihan') {
  return rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0)
}

function formatDashboardDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatCompactRupiah(value: number, tight = false) {
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

function formatDecimal(value: number) {
  const precision = Math.abs(value) >= 10 ? 0 : 1
  return value.toFixed(precision).replace(/\.0$/, '')
}

function formatPercentChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? '+100%' : '0%'

  const change = ((current - previous) / previous) * 100
  const rounded = Math.abs(change) >= 10 ? Math.round(change) : Number(change.toFixed(1))
  return `${change >= 0 ? '+' : ''}${rounded}%`
}

function buildSignupBars(rows: Array<{ created_at: string }>) {
  const buckets = [0, 0, 0, 0]

  for (const row of rows) {
    const date = new Date(row.created_at)
    const index = Math.min(3, Math.max(0, Math.floor((date.getDate() - 1) / 7)))
    buckets[index] += 1
  }

  return buckets
}

function buildRecentActivities({
  payments,
  schedules,
  complaints,
  registrations,
  now,
}: {
  payments: PaymentActivityRow[]
  schedules: ScheduleActivityRow[]
  complaints: ComplaintActivityRow[]
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

  const complaintItems = complaints.map<ActivityWithTimestamp>((complaint) => {
    const pelanggan = firstRelation(complaint.pelanggan)?.nama_lengkap ?? 'Pelanggan'
    const date = complaint.created_at ?? complaint.tanggal

    return {
      id: `complaint-${complaint.id}`,
      title: `${pelanggan} mengirim komplain`,
      meta: `${relativeTime(date, now)} - ${complaint.status ? 'Resolved' : 'Menunggu respons'}`,
      type: 'complaint',
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

  return [...paymentItems, ...scheduleItems, ...complaintItems, ...registrationItems]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4)
    .map(({ timestamp: _timestamp, ...item }) => item)
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
