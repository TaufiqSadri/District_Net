import type { PembayaranWithRelations } from '@/lib/data/pembayaran'
import { getPembayaranPelanggan } from '@/lib/pembayaranPelanggan'
import ApproveRejectActions from '@/components/admin/verification/ApproveRejectActions'
import InvoiceDownloadButton from '@/components/admin/verification/InvoiceDownloadButton'
import ProofButton from '@/components/admin/verification/ProofButton'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { verificationStatusConfig } from '@/constants/admin-status-styles'

export interface InvoiceLookup {
  id: string
  pdf_url: string | null
}

interface VerificationPaymentRowProps {
  pembayaran: PembayaranWithRelations
  status: string
  invoice: InvoiceLookup | undefined
  onApprove: (id: string, pdfUrl: string | null) => void
  onReject: (id: string) => void
  onViewProof: (url: string | null, name: string) => void
}

const monthLabels = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const currencyFormatter = new Intl.NumberFormat('id-ID')
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export default function VerificationPaymentRow({
  pembayaran,
  status,
  invoice,
  onApprove,
  onReject,
  onViewProof,
}: VerificationPaymentRowProps) {
  const pelanggan = getPembayaranPelanggan(pembayaran)
  const customerName = pelanggan?.nama_lengkap ?? '—'
  const period = getPeriodLabel(pembayaran)
  const nominal = pembayaran.jumlah_bayar ?? getNominal(pembayaran)
  const invoicePdfUrl = status === 'diterima' || status === 'lunas' ? invoice?.pdf_url ?? null : null

  return (
    <tr className="border-t border-[#e5e7eb] transition hover:bg-slate-50/50">
      <td className="px-6 py-5 first:px-8">
        <div className="flex min-w-[210px] items-center gap-3 text-[15px]">
          <span className="font-semibold text-slate-900">{customerName}</span>
          <span className="text-slate-500">&mdash;</span>
          <span className="font-normal text-slate-700">{period}</span>
        </div>
      </td>
      <td className="px-6 py-5 text-[15px] font-semibold text-slate-900">
        {nominal != null ? formatCurrency(nominal) : '—'}
      </td>
      <td className="px-6 py-5 text-[15px] font-normal text-slate-700">
        {formatDate(pembayaran.tanggal_pembayaran)}
      </td>
      <td className="px-6 py-5">
        <VerificationStatusBadge status={status} />
      </td>
      <td className="px-6 py-5">
        <ProofButton
          proofUrl={pembayaran.bukti_pembayaran}
          customerName={customerName}
          onViewProof={onViewProof}
        />
      </td>
      <td className="px-6 py-5">
        <InvoiceDownloadButton pdfUrl={invoicePdfUrl} />
      </td>
      <td className="px-6 py-5 text-right last:px-8">
        <ApproveRejectActions
          pembayaran={pembayaran}
          status={status}
          onApprove={onApprove}
          onReject={onReject}
        />
      </td>
    </tr>
  )
}

export function VerificationPaymentMobileRow({
  pembayaran,
  status,
  invoice,
  onApprove,
  onReject,
  onViewProof,
}: VerificationPaymentRowProps) {
  const pelanggan = getPembayaranPelanggan(pembayaran)
  const customerName = pelanggan?.nama_lengkap ?? '—'
  const period = getPeriodLabel(pembayaran)
  const nominal = pembayaran.jumlah_bayar ?? getNominal(pembayaran)
  const invoicePdfUrl = status === 'diterima' || status === 'lunas' ? invoice?.pdf_url ?? null : null

  return (
    <div className="border-t border-[#e5e7eb] px-5 py-5 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-[15px]">
            <span className="font-semibold text-slate-900">{customerName}</span>
            <span className="text-slate-500">&mdash;</span>
            <span className="font-normal text-slate-700">{period}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {nominal != null ? formatCurrency(nominal) : '—'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Upload: {formatDate(pembayaran.tanggal_pembayaran)}
          </p>
        </div>

        <ApproveRejectActions
          pembayaran={pembayaran}
          status={status}
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <VerificationStatusBadge status={status} />
        <ProofButton
          proofUrl={pembayaran.bukti_pembayaran}
          customerName={customerName}
          onViewProof={onViewProof}
        />
        <InvoiceDownloadButton pdfUrl={invoicePdfUrl} />
      </div>
    </div>
  )
}

function VerificationStatusBadge({ status }: { status: string }) {
  const config = verificationStatusConfig[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-600',
    dotClassName: 'bg-slate-400',
  }

  return (
    <PanelStatusBadge
      className={config.className}
      dotClassName={config.dotClassName}
      minWidthClass="min-w-[106px]"
      textClassName="text-[11px] leading-none"
      uppercase
      centered
      ring={false}
    >
      {config.label}
    </PanelStatusBadge>
  )
}

export function getPeriodLabel(pembayaran: PembayaranWithRelations) {
  if (pembayaran.tagihan) {
    return `${monthLabels[pembayaran.tagihan.bulan - 1] ?? pembayaran.tagihan.bulan} ${pembayaran.tagihan.tahun}`
  }

  if (pembayaran.tagihan_instalasi) return 'Instalasi'
  return '—'
}

function getNominal(pembayaran: PembayaranWithRelations) {
  return pembayaran.tagihan?.jumlah_tagihan ?? pembayaran.tagihan_instalasi?.jumlah_tagihan ?? null
}

function formatCurrency(value: number) {
  return `Rp ${currencyFormatter.format(value)}`
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return dateFormatter.format(new Date(value))
}
