import PanelLayout from '@/components/panel/layout/PanelLayout'
import { getCurrentPelanggan } from '@/lib/data/pelanggan'
import { getLatestJadwalInstalasiForPelanggan } from '@/lib/data/jadwalInstalasi'
import { getNotifications, getUnreadNotificationCount } from '@/lib/data/notifikasi'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PanelNotification } from '@/components/panel/layout/PanelNotificationDrawer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Belum tersedia'
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

function formatDate(value: string | null | undefined) {
  if (!value) return 'Belum tersedia'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatRupiah(value: number | null | undefined) {
  return `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`
}

function statusTagihanLabel(status: string | null | undefined) {
  const map: Record<string, string> = {
    belum_bayar: 'Belum Bayar',
    menunggu_verifikasi: 'Menunggu Verifikasi',
    lunas: 'Lunas',
  }
  return status ? map[status] ?? status : 'Belum tersedia'
}

function statusJadwalLabel(status: string | null | undefined) {
  const map: Record<string, string> = {
    menunggu_jadwal: 'Menunggu Jadwal',
    terjadwal: 'Terjadwal',
    dikerjakan: 'Sedang Dikerjakan',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
  }
  return status ? map[status] ?? status : 'Menunggu Jadwal'
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pelanggan = await getCurrentPelanggan()
  if (!pelanggan) redirect('/login')

  const supabase = await createClient()
  const now = new Date()

  const [tagihanInstalasi, tagihanTerbuka, jadwalInstalasi, notificationRows, notificationUnreadCount] = await Promise.all([
    supabase
      .from('tagihan_instalasi')
      .select('*')
      .eq('pelanggan_id', pelanggan.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then((result) => result.data),
    supabase
      .from('tagihan')
      .select('*')
      .eq('pelanggan_id', pelanggan.id)
      .neq('status_tagihan', 'lunas')
      .order('created_at', { ascending: false })
      .limit(3)
      .then((result) => result.data ?? []),
    getLatestJadwalInstalasiForPelanggan(pelanggan.id),
    getNotifications(),
    getUnreadNotificationCount(),
  ])

  const notifications: PanelNotification[] = []

  for (const item of notificationRows) {
    const isScheduleNotification = item.type === 'jadwal' || item.type === 'jadwal_layanan'
    const isBillingNotification = item.type === 'tagihan' || item.type === 'tagihan_instalasi'

    notifications.push({
      id: item.id,
      title: item.title,
      summary: item.message,
      time: formatDateTime(item.scheduled_at ?? item.created_at ?? now.toISOString()),
      tone: isScheduleNotification ? 'blue' : isBillingNotification ? 'orange' : 'purple',
      icon: isScheduleNotification ? 'calendar' : isBillingNotification ? 'receipt' : 'alert',
      status: item.is_read ? 'Dibaca' : 'Baru',
      isUnread: !item.is_read,
      canMarkRead: !item.is_read,
    })
  }

  if (pelanggan.status_langganan === 'proses_instalasi') {
    const status = statusJadwalLabel(jadwalInstalasi?.status)
    const scheduled = jadwalInstalasi?.tanggal_jadwal
      ? formatDateTime(jadwalInstalasi.tanggal_jadwal)
      : 'Belum dijadwalkan'

    notifications.push({
      id: 'proses-instalasi',
      title:
        jadwalInstalasi?.status === 'terjadwal'
          ? 'Instalasi Sudah Dijadwalkan'
          : jadwalInstalasi?.status === 'dikerjakan'
          ? 'Instalasi Sedang Dikerjakan'
          : 'Proses Instalasi',
      summary:
        jadwalInstalasi?.tanggal_jadwal
          ? `Pemasangan dijadwalkan pada ${scheduled}.`
          : 'Pembayaran instalasi sudah diverifikasi. Tim Distric Net akan menghubungi Anda untuk menentukan jadwal pemasangan.',
      time: formatDateTime(jadwalInstalasi?.updated_at ?? jadwalInstalasi?.created_at ?? now.toISOString()),
      tone: 'blue',
      icon: 'wrench',
      status,
      href: tagihanInstalasi?.id ? `/dashboard/tagihan-instalasi/${tagihanInstalasi.id}` : undefined,
      actionLabel: 'Lihat Tagihan Instalasi',
      details: [
        { label: 'Status', value: status },
        { label: 'Jadwal', value: scheduled },
        { label: 'Teknisi', value: jadwalInstalasi?.teknisi ?? 'Belum ditentukan' },
        { label: 'Catatan', value: jadwalInstalasi?.catatan ?? 'Belum ada catatan' },
      ],
    })
  }

  if (tagihanInstalasi && tagihanInstalasi.status_tagihan !== 'lunas') {
    notifications.push({
      id: 'tagihan-instalasi',
      title:
        tagihanInstalasi.status_tagihan === 'menunggu_verifikasi'
          ? 'Pembayaran Instalasi Sedang Diverifikasi'
          : 'Tagihan Instalasi Belum Dibayar',
      summary:
        tagihanInstalasi.status_tagihan === 'menunggu_verifikasi'
          ? 'Bukti pembayaran instalasi sudah terkirim dan sedang dicek admin.'
          : 'Selesaikan tagihan instalasi agar jadwal pemasangan bisa diproses.',
      time: formatDateTime(tagihanInstalasi.created_at),
      tone: tagihanInstalasi.status_tagihan === 'menunggu_verifikasi' ? 'yellow' : 'orange',
      icon: 'receipt',
      status: statusTagihanLabel(tagihanInstalasi.status_tagihan),
      href: `/dashboard/tagihan-instalasi/${tagihanInstalasi.id}`,
      actionLabel:
        tagihanInstalasi.status_tagihan === 'menunggu_verifikasi'
          ? 'Lihat Pembayaran'
          : 'Bayar Instalasi',
      details: [
        { label: 'Jumlah', value: formatRupiah(tagihanInstalasi.jumlah_tagihan) },
        { label: 'Jatuh Tempo', value: formatDate(tagihanInstalasi.jatuh_tempo) },
        { label: 'Status Tagihan', value: statusTagihanLabel(tagihanInstalasi.status_tagihan) },
      ],
    })
  }

  if (tagihanTerbuka.length > 0) {
    const latest = tagihanTerbuka[0]
    notifications.push({
      id: 'tagihan-bulanan',
      title: tagihanTerbuka.length > 1 ? 'Beberapa Tagihan Bulanan Belum Lunas' : 'Tagihan Bulanan Belum Lunas',
      summary:
        tagihanTerbuka.length > 1
          ? `Ada ${tagihanTerbuka.length} tagihan bulanan yang masih perlu diselesaikan.`
          : 'Ada tagihan bulanan yang masih perlu diselesaikan.',
      time: formatDateTime(latest.created_at),
      tone: latest.status_tagihan === 'menunggu_verifikasi' ? 'yellow' : 'pink',
      icon: 'receipt',
      status: statusTagihanLabel(latest.status_tagihan),
      href: '/dashboard/tagihan',
      actionLabel: 'Lihat Tagihan',
      details: tagihanTerbuka.map((tagihan: any) => ({
        label: `${tagihan.bulan}/${tagihan.tahun}`,
        value: `${formatRupiah(tagihan.jumlah_tagihan)} · ${statusTagihanLabel(tagihan.status_tagihan)} · Jatuh tempo ${formatDate(tagihan.jatuh_tempo)}`,
      })),
    })
  }

  notifications.push({
    id: 'info-dashboard',
    title: 'Informasi Dashboard Pelanggan',
    summary:
      'Gunakan dashboard ini untuk memantau tagihan, pembayaran, jadwal instalasi, dan status layanan Distric Net Anda.',
    time: formatDateTime(now.toISOString()),
    tone: 'purple',
    icon: 'clock',
    status: 'Info',
  })

  return (
    <PanelLayout
      variant="customer"
      user={{
        name: pelanggan.nama_lengkap,
        email: pelanggan.email,
        roleLabel: 'Pelanggan District Net',
      }}
      notifications={notifications}
      notificationUnreadCount={notificationUnreadCount}
    >
      {children}
    </PanelLayout>
  )
}
