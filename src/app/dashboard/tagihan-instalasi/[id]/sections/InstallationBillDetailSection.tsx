import { CalendarClock, ReceiptText, UserRound, Wrench } from 'lucide-react'
import type { ReactNode } from 'react'
import PanelInfoTile from '@/components/panel/shared/PanelInfoTile'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { getPanelTagihanTone, getPanelVerificationTone } from '@/components/panel/shared/panelStatus'
import {
  formatRupiah,
  getStatusTagihanMeta,
  getStatusVerifikasiMeta,
} from '@/lib/data/dashboardPelanggan'
import type { JadwalInstalasi, PembayaranRow, TagihanInstalasi } from '@/types/database'
import PaymentMethod from '../../../tagihan/[id]/PaymentMethod'

interface InstallationBillDetailSectionProps {
  tagihanInstalasi: TagihanInstalasi
  jadwalInstalasi: JadwalInstalasi | null
  latestPayment?: PembayaranRow
}

export default function InstallationBillDetailSection({
  tagihanInstalasi,
  jadwalInstalasi,
  latestPayment,
}: InstallationBillDetailSectionProps) {
  const badge = getStatusTagihanMeta(tagihanInstalasi.status_tagihan)
  const instalasiInfo = getInstallationInfo(tagihanInstalasi, jadwalInstalasi)

  return (
    <PanelSectionCard
      title="Tagihan Instalasi"
      subtitle="Biaya instalasi perangkat"
      action={
        <PanelStatusBadge tone={getPanelTagihanTone(tagihanInstalasi.status_tagihan)}>
          {badge.label}
        </PanelStatusBadge>
      }
    >
      <div className={`mb-6 rounded-xl border px-4 py-3 text-[14px] leading-6 ${instalasiInfo.className}`}>
        <p className="font-semibold">{instalasiInfo.title}</p>
        <p className="mt-1">{instalasiInfo.message}</p>
      </div>

      {tagihanInstalasi.status_tagihan === 'lunas' ? (
        <InstallationScheduleInfo jadwalInstalasi={jadwalInstalasi} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <PanelInfoTile
          label="Nominal Tagihan"
          value={formatRupiah(tagihanInstalasi.jumlah_tagihan)}
        />
        <PanelInfoTile
          label="Jatuh Tempo"
          value={
            tagihanInstalasi.jatuh_tempo
              ? new Date(tagihanInstalasi.jatuh_tempo).toLocaleDateString('id-ID')
              : 'Belum diatur'
          }
        />
      </div>

      {latestPayment ? <LatestInstallationPayment latestPayment={latestPayment} /> : null}
      <PaymentMethod />
    </PanelSectionCard>
  )
}

function InstallationScheduleInfo({
  jadwalInstalasi,
}: {
  jadwalInstalasi: JadwalInstalasi | null
}) {
  return (
    <div className="mb-6 rounded-[18px] border border-blue-100 bg-blue-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Wrench size={16} className="text-blue-700" />
        <h2 className="font-semibold text-blue-900">Informasi Proses Instalasi</h2>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <ScheduleTile
          icon={<CalendarClock size={13} />}
          label="Jadwal"
          value={
            jadwalInstalasi?.tanggal_jadwal
              ? new Date(jadwalInstalasi.tanggal_jadwal).toLocaleString('id-ID')
              : 'Belum dijadwalkan'
          }
        />
        <ScheduleTile
          icon={<UserRound size={13} />}
          label="Teknisi"
          value={jadwalInstalasi?.teknisi ?? 'Belum ditentukan'}
        />
      </div>
      {jadwalInstalasi?.catatan ? (
        <p className="mt-3 rounded-xl bg-white px-3 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Catatan:</span> {jadwalInstalasi.catatan}
        </p>
      ) : null}
    </div>
  )
}

function LatestInstallationPayment({
  latestPayment,
}: {
  latestPayment: PembayaranRow
}) {
  const verification = getStatusVerifikasiMeta(latestPayment.status_verifikasi)

  return (
    <div className="mt-6 rounded-[18px] border border-[#e5e7eb] p-4">
      <div className="mb-3 flex items-center gap-2">
        <ReceiptText size={16} className="text-[#6741f5]" />
        <h2 className="font-semibold text-[#111827]">Pembayaran Terakhir</h2>
      </div>

      <div className="space-y-3 text-sm">
        <DetailLine
          label="Tanggal Bayar"
          value={new Date(latestPayment.tanggal_pembayaran).toLocaleString('id-ID')}
        />
        <DetailLine label="Jumlah" value={formatRupiah(latestPayment.jumlah_bayar)} />
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Status Verifikasi</span>
          <PanelStatusBadge tone={getPanelVerificationTone(latestPayment.status_verifikasi)}>
            {verification.label}
          </PanelStatusBadge>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Bukti</span>
          {latestPayment.bukti_pembayaran ? (
            <a
              href={latestPayment.bukti_pembayaran}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#6741f5] hover:underline"
            >
              Buka Link
            </a>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
        {latestPayment.catatan_admin ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">Catatan admin:</span> {latestPayment.catatan_admin}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ScheduleTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-white px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-700">{value}</span>
    </div>
  )
}

function getInstallationInfo(
  tagihanInstalasi: TagihanInstalasi,
  jadwalInstalasi: JadwalInstalasi | null,
) {
  if (tagihanInstalasi.status_tagihan === 'lunas') {
    return {
      title: 'Instalasi Siap Diproses',
      message: jadwalInstalasi?.tanggal_jadwal
        ? `Pembayaran instalasi sudah lunas. Jadwal pemasangan: ${new Date(jadwalInstalasi.tanggal_jadwal).toLocaleString('id-ID')}.`
        : 'Pembayaran instalasi sudah lunas. Tim District Net akan menghubungi Anda untuk konfirmasi jadwal pemasangan di alamat pemasangan.',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    }
  }

  if (tagihanInstalasi.status_tagihan === 'menunggu_verifikasi') {
    return {
      title: 'Pembayaran Sedang Diverifikasi',
      message:
        'Bukti pembayaran sudah terkirim. Admin akan memeriksa pembayaran terlebih dahulu, lalu tim District Net akan menghubungi Anda untuk konfirmasi jadwal pemasangan.',
      className: 'border-amber-200 bg-amber-50 text-amber-800',
    }
  }

  return {
    title: 'Menunggu Pembayaran Instalasi',
    message:
      'Selesaikan pembayaran instalasi agar tim District Net dapat memproses jadwal pemasangan di alamat pemasangan Anda.',
    className: 'border-orange-200 bg-orange-50 text-orange-800',
  }
}
