import DashboardOverviewContent from '@/app/admin/sections/DashboardOverviewContent'
import {
  type AmountRow,
  buildRecentActivities,
  formatPercentChange,
  mapRegistrations,
  type PelangganBaru,
  type TicketActivityRow,
  type PaymentActivityRow,
  type ScheduleActivityRow,
  sumRows,
} from '@/app/admin/sections/dashboardOverviewUtils'
import { getTicketStats } from '@/lib/data/tiket'
import { syncSuspendedPelangganStatuses } from '@/lib/data/pelangganStatus'
import { createAdminClient } from '@/lib/supabase/admin'

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
    ticketStats,
    { data: paymentActivities },
    { data: scheduleActivities },
    { data: ticketActivities },
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
    getTicketStats(),
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
      .from('jadwal_layanan')
      .select('id, jenis_jadwal, status, created_at, updated_at, pelanggan:pelanggan_id ( nama_lengkap )')
      .order('created_at', { ascending: false })
      .limit(3),
    admin
      .from('tiket_layanan')
      .select('id, nomor_tiket, subjek, status, created_at, pelanggan:pelanggan_id ( nama_lengkap )')
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
    ...((tagihanRows ?? []) as AmountRow[]),
    ...((tagihanInstalasiRows ?? []) as AmountRow[]),
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
  const unpaidBillCount = allBillingRows.filter((row) => row.status_tagihan === 'belum_bayar').length

  const currentRevenue = sumRows((revenueThisMonth ?? []) as AmountRow[], 'jumlah_bayar')
  const previousRevenue = sumRows((revenuePreviousMonth ?? []) as AmountRow[], 'jumlah_bayar')
  const revenueChange = formatPercentChange(currentRevenue, previousRevenue)
  const activeRate = totalPelanggan > 0 ? Math.round((pelangganAktif / totalPelanggan) * 100) : 0
  const registrations = mapRegistrations((pelangganBaru ?? []) as PelangganBaru[])
  const activities = buildRecentActivities({
    payments: (paymentActivities ?? []) as PaymentActivityRow[],
    schedules: (scheduleActivities ?? []) as ScheduleActivityRow[],
    tickets: (ticketActivities ?? []) as TicketActivityRow[],
    registrations: (pelangganBaru ?? []) as PelangganBaru[],
    now,
  })

  return (
    <DashboardOverviewContent
      now={now}
      totalPelanggan={totalPelanggan}
      pelangganAktif={pelangganAktif}
      pelangganPending={pelangganPending}
      pelangganDitangguhkan={pelangganDitangguhkan}
      pelangganProsesInstalasi={pelangganProsesInstalasi}
      pelangganNonaktif={pelangganNonaktif}
      newSignupsThisMonth={newSignupsThisMonth}
      signups={signups}
      currentRevenue={currentRevenue}
      revenueChange={revenueChange}
      activeRate={activeRate}
      billingTotals={billingTotals}
      paidPercent={paidPercent}
      unpaidBillCount={unpaidBillCount}
      ticketStats={ticketStats}
      registrations={registrations}
      activities={activities}
    />
  )
}
