import { ReceiptText } from 'lucide-react'
import PanelInfoTile from '@/components/panel/shared/PanelInfoTile'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { getPanelTagihanTone, getPanelVerificationTone } from '@/components/panel/shared/panelStatus'
import {
  formatPeriode,
  formatRupiah,
  getStatusTagihanMeta,
  getStatusVerifikasiMeta,
} from '@/lib/data/dashboardPelanggan'
import type { PembayaranRow, TagihanRow } from '@/types/database'
import PaymentMethod from '../PaymentMethod'

interface MonthlyBillDetailSectionProps {
  tagihan: TagihanRow
  latestPayment?: PembayaranRow
}

export default function MonthlyBillDetailSection({
  tagihan,
  latestPayment,
}: MonthlyBillDetailSectionProps) {
  const badge = getStatusTagihanMeta(tagihan.status_tagihan)

  return (
    <PanelSectionCard
      title="Detail Tagihan"
      subtitle={formatPeriode(tagihan.bulan, tagihan.tahun)}
      action={
        <PanelStatusBadge tone={getPanelTagihanTone(tagihan.status_tagihan)}>
          {badge.label}
        </PanelStatusBadge>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <PanelInfoTile
          label="Nominal Tagihan"
          value={formatRupiah(tagihan.jumlah_tagihan)}
        />
        <PanelInfoTile
          label="Jatuh Tempo"
          value={
            tagihan.jatuh_tempo
              ? new Date(tagihan.jatuh_tempo).toLocaleDateString('id-ID')
              : 'Belum diatur'
          }
        />
      </div>

      {latestPayment ? <LatestPaymentCard latestPayment={latestPayment} /> : null}
      <PaymentMethod />
    </PanelSectionCard>
  )
}

function LatestPaymentCard({ latestPayment }: { latestPayment: PembayaranRow }) {
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

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-700">{value}</span>
    </div>
  )
}
