import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'
import { getDashboardPelangganData } from '@/lib/data/dashboardPelanggan'
import { createAdminClient } from '@/lib/supabase/admin'
import PaymentHistorySection from './sections/PaymentHistorySection'

export default async function RiwayatPage() {
  const { pembayaran } = await getDashboardPelangganData()
  const admin = createAdminClient()
  const pembayaranIds = pembayaran.map((item) => item.id)
  const invoiceMap: Record<string, { id: string; pdf_url: string | null }> = {}

  if (pembayaranIds.length > 0) {
    const { data: invoices } = await admin
      .from('invoice')
      .select('id, pembayaran_id, pdf_url')
      .in('pembayaran_id', pembayaranIds)

    for (const invoice of invoices ?? []) {
      invoiceMap[invoice.pembayaran_id] = {
        id: invoice.id,
        pdf_url: invoice.pdf_url,
      }
    }
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Riwayat Bayar"
        subtitle="Lihat daftar pembayaran yang sudah pernah Anda kirim."
      />
      <PaymentHistorySection pembayaran={pembayaran} invoiceMap={invoiceMap} />
    </div>
  )
}
