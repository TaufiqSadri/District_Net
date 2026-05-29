import { History, Link2, Wrench } from 'lucide-react'
import InvoiceButton from '@/components/InvoiceButton'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { getPanelVerificationTone } from '@/components/panel/shared/panelStatus'
import {
  formatPeriode,
  formatRupiah,
  getStatusVerifikasiMeta,
  type PembayaranWithTagihan,
} from '@/lib/data/dashboardPelanggan'

interface PaymentHistorySectionProps {
  pembayaran: PembayaranWithTagihan[]
  invoiceMap: Record<string, { id: string; pdf_url: string | null }>
}

export default function PaymentHistorySection({
  pembayaran,
  invoiceMap,
}: PaymentHistorySectionProps) {
  return (
    <PanelSectionCard title="Riwayat Pembayaran" bodyClassName="p-0">
      {pembayaran.length === 0 ? (
        <div className="px-6 py-12 text-center text-[14px] text-slate-400">
          Belum ada riwayat pembayaran.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f7f9fe] text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4">Periode</th>
                <th className="px-6 py-4">Tanggal Bayar</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Bukti</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {pembayaran.map((item) => {
                const badge = getStatusVerifikasiMeta(item.status_verifikasi)
                const isInstallasi = item.tagihan_instalasi != null && item.tagihan == null
                const invoice = invoiceMap[item.id]

                return (
                  <tr key={item.id} className="border-b border-[#eef2f7] last:border-0">
                    <td className="px-6 py-4">
                      {isInstallasi ? (
                        <PanelStatusBadge tone="orange" icon={<Wrench size={11} />}>
                          Instalasi
                        </PanelStatusBadge>
                      ) : item.tagihan ? (
                        <span className="font-medium text-slate-700">
                          {formatPeriode(item.tagihan.bulan, item.tagihan.tahun)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.tanggal_pembayaran).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatRupiah(item.jumlah_bayar)}
                    </td>
                    <td className="px-6 py-4">
                      {item.bukti_pembayaran ? (
                        <a
                          href={item.bukti_pembayaran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#6741f5] hover:underline"
                        >
                          <Link2 size={14} />
                          Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <PanelStatusBadge tone={getPanelVerificationTone(item.status_verifikasi)}>
                          {badge.label}
                        </PanelStatusBadge>
                        {item.catatan_admin ? (
                          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                            <History size={14} className="mt-0.5 flex-shrink-0" />
                            <span>{item.catatan_admin}</span>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.status_verifikasi === 'diterima' ? (
                        <InvoiceButton
                          pembayaranId={item.id}
                          invoiceId={invoice?.id ?? null}
                          invoicePdfUrl={invoice?.pdf_url ?? null}
                          variant="customer"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
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
