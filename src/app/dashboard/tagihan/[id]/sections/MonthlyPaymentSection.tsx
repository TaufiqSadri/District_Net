import { CircleAlert, FileText } from 'lucide-react'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { getPanelVerificationTone } from '@/components/panel/shared/panelStatus'
import {
  getStatusVerifikasiMeta,
} from '@/lib/data/dashboardPelanggan'
import type { PembayaranRow } from '@/types/database'
import PaymentUploadForm from '../PaymentUploadForm'

interface MonthlyPaymentSectionProps {
  canSubmitPayment: boolean
  userId: string
  tagihanId: string
  defaultAmount: number
  pembayaran: PembayaranRow[]
}

export default function MonthlyPaymentSection({
  canSubmitPayment,
  userId,
  tagihanId,
  defaultAmount,
  pembayaran,
}: MonthlyPaymentSectionProps) {
  return (
    <PanelSectionCard
      title="Kirim Bukti Pembayaran"
      subtitle="Unggah bukti transfer agar pembayaran bisa diverifikasi admin."
    >
      {canSubmitPayment ? (
        <PaymentUploadForm
          userId={userId}
          tagihanId={tagihanId}
          defaultAmount={defaultAmount}
        />
      ) : (
        <div className="rounded-xl border border-[#e5e7eb] bg-[#f8faff] px-4 py-4 text-sm text-slate-600">
          <div className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
            <CircleAlert size={16} className="text-[#6741f5]" />
            Pembayaran tidak dapat dikirim ulang
          </div>
          <p>
            Tagihan ini sedang diproses atau sudah lunas. Jika ada kendala, silakan hubungi admin.
          </p>
        </div>
      )}

      {pembayaran.length > 1 ? (
        <div className="mt-6 rounded-[18px] border border-[#e5e7eb] p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText size={16} className="text-[#6741f5]" />
            <h3 className="font-semibold text-[#111827]">Riwayat Pengiriman</h3>
          </div>
          <div className="space-y-3">
            {pembayaran.map((item) => {
              const badge = getStatusVerifikasiMeta(item.status_verifikasi)

              return (
                <div key={item.id} className="rounded-xl bg-[#f8faff] px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">
                      {new Date(item.tanggal_pembayaran).toLocaleString('id-ID')}
                    </span>
                    <PanelStatusBadge tone={getPanelVerificationTone(item.status_verifikasi)}>
                      {badge.label}
                    </PanelStatusBadge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </PanelSectionCard>
  )
}
