import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  History,
  MessageSquare,
  PauseCircle,
  Receipt,
  Wifi,
  Wrench,
} from 'lucide-react'
import PanelAlert from '@/components/panel/shared/PanelAlert'
import PanelMetricCard from '@/components/panel/shared/PanelMetricCard'
import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import {
  getPanelSubscriptionTone,
  getPanelTagihanTone,
  getPanelVerificationTone,
} from '@/components/panel/shared/panelStatus'
import {
  formatRupiah,
  getStatusTagihanMeta,
  getStatusVerifikasiMeta,
} from '@/lib/data/dashboardPelanggan'
import type {
  JadwalInstalasi,
  PelangganWithPaket,
  PembayaranRow,
  TagihanInstalasi,
  TagihanRow,
} from '@/types/database'

type PembayaranWithTagihan = PembayaranRow & {
  tagihan: { bulan: number; tahun: number } | null
}

interface DashboardOverviewContentProps {
  now: Date
  pelanggan: PelangganWithPaket
  tagihanBulanIni: { jumlah_tagihan: number; status_tagihan: string } | null
  tagihanRows: TagihanRow[]
  pembayaranRows: PembayaranWithTagihan[]
  tagihanInstalasi: TagihanInstalasi | null
  jadwalInstalasi: JadwalInstalasi | null
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

export default function DashboardOverviewContent({
  now,
  pelanggan,
  tagihanBulanIni,
  tagihanRows,
  pembayaranRows,
  tagihanInstalasi,
  jadwalInstalasi,
}: DashboardOverviewContentProps) {
  const paket = pelanggan.paket_internet
  const firstName = pelanggan.nama_lengkap.split(' ')[0]
  const isDitangguhkan = pelanggan.status_langganan === 'ditangguhkan'
  const isProsesInstalasi = pelanggan.status_langganan === 'proses_instalasi'
  const hasInstalasiBelumLunas = Boolean(tagihanInstalasi && tagihanInstalasi.status_tagihan !== 'lunas')
  const instalasiNotice = getInstallationNotice(tagihanInstalasi)
  const statusLanggananMeta = getSubscriptionMeta({
    pelanggan,
    jadwalInstalasi,
    hasInstalasiBelumLunas,
  })

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <PanelPageHeader
          title={`Selamat datang, ${firstName}!`}
          subtitle={`${formatDashboardDate(now)} - ${paket?.nama_paket ?? 'Paket tidak ditemukan'}`}
        />
        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
          <QuickAction href="/dashboard/paket" icon={<Wifi size={18} />}>
            Paket Internet
          </QuickAction>
          <QuickAction href="/dashboard/tagihan" icon={<Receipt size={18} />}>
            Bayar Tagihan
          </QuickAction>
          <QuickAction href="/dashboard/komplain" icon={<MessageSquare size={18} />}>
            Kirim Komplain
          </QuickAction>
        </div>
      </div>

      {isDitangguhkan ? (
        <PanelAlert
          tone="warning"
          action={
            <Link
              href={
                hasInstalasiBelumLunas && tagihanInstalasi
                  ? `/dashboard/tagihan-instalasi/${tagihanInstalasi.id}`
                  : '/dashboard/tagihan'
              }
              className="inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              {hasInstalasiBelumLunas ? instalasiNotice.action : 'Bayar Tagihan'}
            </Link>
          }
        >
          <p className="font-semibold">
            {hasInstalasiBelumLunas ? instalasiNotice.title : 'Layanan Ditangguhkan Sementara'}
          </p>
          <p className="mt-1 font-normal">
            {hasInstalasiBelumLunas
              ? instalasiNotice.message
              : 'Layanan Anda sedang ditangguhkan karena ada tagihan bulanan yang melewati jatuh tempo.'}
          </p>
        </PanelAlert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PanelMetricCard
          label="Paket Aktif"
          value={`${paket?.kecepatan_mbps ?? '-'} Mbps`}
          sub={`${paket?.nama_paket ?? '-'} - ${formatRupiah(paket?.harga ?? 0)}/bln`}
          icon={<Wifi size={18} />}
          tone="violet"
        />
        <PanelMetricCard
          label={`Tagihan ${monthNames[now.getMonth()]} ${now.getFullYear()}`}
          value={tagihanBulanIni ? formatRupiah(tagihanBulanIni.jumlah_tagihan) : 'Gratis'}
          sub={tagihanBulanIni ? getStatusTagihanMeta(tagihanBulanIni.status_tagihan).label : 'Bulan pertama'}
          icon={<Receipt size={18} />}
          tone={tagihanBulanIni ? getPanelTagihanTone(tagihanBulanIni.status_tagihan) : 'emerald'}
        />
        <PanelMetricCard
          label="Status Langganan"
          value={statusLanggananMeta.label}
          sub={statusLanggananMeta.sub}
          icon={statusLanggananMeta.icon}
          tone={statusLanggananMeta.tone}
        />
      </div>

      {tagihanInstalasi ? (
        <InstallationInvoiceSection tagihanInstalasi={tagihanInstalasi} />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyBillsSection rows={tagihanRows} />
        <PaymentHistoryPreview rows={pembayaranRows} />
      </div>

      {isProsesInstalasi ? (
        <PanelSectionCard
          title="Aktivitas Instalasi"
          subtitle="Status terbaru proses pemasangan layanan di alamat Anda."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoBlock label="Status" value={formatInstallationStatus(jadwalInstalasi?.status)} />
            <InfoBlock
              label="Jadwal"
              value={
                jadwalInstalasi?.tanggal_pemasangan
                  ? new Date(jadwalInstalasi.tanggal_pemasangan).toLocaleString('id-ID')
                  : 'Belum dijadwalkan'
              }
            />
            <InfoBlock label="Teknisi" value={jadwalInstalasi?.teknisi ?? 'Belum ditentukan'} />
          </div>
        </PanelSectionCard>
      ) : null}
    </div>
  )
}

function InstallationInvoiceSection({
  tagihanInstalasi,
}: {
  tagihanInstalasi: TagihanInstalasi
}) {
  const badge = getStatusTagihanMeta(tagihanInstalasi.status_tagihan)

  return (
    <PanelSectionCard
      title="Tagihan Instalasi"
      subtitle="Biaya instalasi perangkat dan status pembayaran pemasangan."
      action={
        <Link
          href={`/dashboard/tagihan-instalasi/${tagihanInstalasi.id}`}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#6741f5] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6]"
        >
          {tagihanInstalasi.status_tagihan === 'belum_bayar' ? 'Bayar Instalasi' : 'Lihat Detail'}
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr]">
        <InfoBlock label="Keterangan" value="Biaya Instalasi Perangkat" />
        <InfoBlock label="Jumlah" value={formatRupiah(tagihanInstalasi.jumlah_tagihan)} />
        <InfoBlock
          label="Jatuh Tempo"
          value={
            tagihanInstalasi.jatuh_tempo
              ? new Date(tagihanInstalasi.jatuh_tempo).toLocaleDateString('id-ID')
              : '-'
          }
        />
        <div className="rounded-xl border border-[#e5e7eb] bg-[#f8faff] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Status
          </p>
          <div className="mt-2">
            <PanelStatusBadge tone={getPanelTagihanTone(tagihanInstalasi.status_tagihan)}>
              {badge.label}
            </PanelStatusBadge>
          </div>
        </div>
      </div>
    </PanelSectionCard>
  )
}

function MonthlyBillsSection({ rows }: { rows: TagihanRow[] }) {
  return (
    <PanelSectionCard
      title="Tagihan Bulanan"
      subtitle="Lima tagihan terbaru dari layanan aktif Anda."
      action={<SmallLink href="/dashboard/tagihan">Lihat Semua</SmallLink>}
      bodyClassName="p-0"
    >
      {rows.length === 0 ? (
        <EmptyState text="Belum ada tagihan bulanan." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f7f9fe] text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4">Periode</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const badge = getStatusTagihanMeta(row.status_tagihan)

                return (
                  <tr key={row.id} className="border-b border-[#eef2f7] last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {monthNames[row.bulan - 1]} {row.tahun}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatRupiah(row.jumlah_tagihan)}
                    </td>
                    <td className="px-6 py-4">
                      <PanelStatusBadge tone={getPanelTagihanTone(row.status_tagihan)}>
                        {badge.label}
                      </PanelStatusBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {row.status_tagihan === 'belum_bayar' ? (
                        <Link
                          href={`/dashboard/tagihan/${row.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6741f5] px-3 text-xs font-semibold text-white transition hover:bg-[#5b2fd6]"
                        >
                          Bayar
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/tagihan/${row.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-[#dfe5ef] px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          Detail
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PanelSectionCard>
  )
}

function PaymentHistoryPreview({ rows }: { rows: PembayaranWithTagihan[] }) {
  return (
    <PanelSectionCard
      title="Riwayat Pembayaran"
      subtitle="Pembayaran terbaru yang pernah Anda kirim."
      action={<SmallLink href="/dashboard/riwayat">Lihat Semua</SmallLink>}
      bodyClassName="p-0"
    >
      {rows.length === 0 ? (
        <EmptyState text="Belum ada pembayaran." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f7f9fe] text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const badge = getStatusVerifikasiMeta(row.status_verifikasi)

                return (
                  <tr key={row.id} className="border-b border-[#eef2f7] last:border-0">
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(row.tanggal_pembayaran).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatRupiah(row.jumlah_bayar)}
                    </td>
                    <td className="px-6 py-4">
                      <PanelStatusBadge tone={getPanelVerificationTone(row.status_verifikasi)}>
                        {badge.label}
                      </PanelStatusBadge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PanelSectionCard>
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

function SmallLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center justify-center rounded-xl border border-[#dfe5ef] px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
    >
      {children}
    </Link>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-[#f8faff] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-[15px] font-semibold text-[#111827]">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="px-6 py-12 text-center text-[14px] text-slate-400">{text}</div>
}

function getSubscriptionMeta({
  pelanggan,
  jadwalInstalasi,
  hasInstalasiBelumLunas,
}: {
  pelanggan: PelangganWithPaket
  jadwalInstalasi: JadwalInstalasi | null
  hasInstalasiBelumLunas: boolean
}) {
  if (pelanggan.status_langganan === 'ditangguhkan') {
    return {
      label: hasInstalasiBelumLunas ? 'Menunggu Instalasi' : 'Ditangguhkan',
      sub: hasInstalasiBelumLunas
        ? 'Pembayaran instalasi belum selesai'
        : 'Ada tagihan yang perlu dibayar',
      icon: <PauseCircle size={18} />,
      tone: 'orange' as const,
    }
  }

  if (pelanggan.status_langganan === 'proses_instalasi') {
    return {
      label: 'Proses Instalasi',
      sub: jadwalInstalasi?.tanggal_pemasangan
        ? `Jadwal ${new Date(jadwalInstalasi.tanggal_pemasangan).toLocaleDateString('id-ID')}`
        : 'Menunggu jadwal pemasangan',
      icon: <Wrench size={18} />,
      tone: 'blue' as const,
    }
  }

  if (pelanggan.status_langganan === 'aktif') {
    return {
      label: 'Aktif',
      sub: pelanggan.tanggal_bergabung
        ? `Bergabung ${new Date(pelanggan.tanggal_bergabung).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          })}`
        : 'Layanan aktif',
      icon: <CheckCircle size={18} />,
      tone: 'emerald' as const,
    }
  }

  return {
    label: pelanggan.status_langganan,
    sub: 'Status layanan',
    icon: <AlertTriangle size={18} />,
    tone: getPanelSubscriptionTone(pelanggan.status_langganan),
  }
}

function getInstallationNotice(tagihanInstalasi: TagihanInstalasi | null) {
  if (tagihanInstalasi?.status_tagihan === 'menunggu_verifikasi') {
    return {
      title: 'Pembayaran Instalasi Sedang Diverifikasi',
      message:
        'Bukti pembayaran instalasi sudah dikirim. Admin akan memeriksa pembayaran terlebih dahulu, lalu tim District Net akan menghubungi Anda untuk konfirmasi jadwal pemasangan.',
      action: 'Lihat Detail',
    }
  }

  return {
    title: 'Menunggu Pembayaran Instalasi',
    message:
      'Pendaftaran Anda sudah disetujui. Silakan selesaikan pembayaran instalasi agar tim District Net dapat memproses jadwal pemasangan.',
    action: 'Bayar Instalasi',
  }
}

function formatInstallationStatus(status: string | null | undefined) {
  const map: Record<string, string> = {
    menunggu_jadwal: 'Menunggu Jadwal',
    terjadwal: 'Terjadwal',
    dikerjakan: 'Sedang Dikerjakan',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
  }
  return status ? map[status] ?? status : 'Menunggu Jadwal'
}

function formatDashboardDate(date: Date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
