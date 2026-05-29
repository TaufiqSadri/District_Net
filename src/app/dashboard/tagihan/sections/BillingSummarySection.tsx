import { AlertCircle, CheckCircle2, Receipt } from 'lucide-react'
import PanelMetricCard from '@/components/panel/shared/PanelMetricCard'
import { formatRupiah } from '@/lib/data/dashboardPelanggan'

interface BillingSummarySectionProps {
  totalTagihan: number
  totalBelumBayar: number
  totalTunggakan: number
  totalMenunggu: number
}

export default function BillingSummarySection({
  totalTagihan,
  totalBelumBayar,
  totalTunggakan,
  totalMenunggu,
}: BillingSummarySectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <PanelMetricCard
        label="Total Tagihan"
        value={totalTagihan}
        sub="Tagihan bulanan & instalasi"
        icon={<Receipt size={18} />}
        tone="violet"
      />
      <PanelMetricCard
        label="Belum Dibayar"
        value={totalBelumBayar}
        sub={formatRupiah(totalTunggakan)}
        icon={<AlertCircle size={18} />}
        tone="red"
      />
      <PanelMetricCard
        label="Menunggu Verifikasi"
        value={totalMenunggu}
        sub="Sedang dicek admin"
        icon={<CheckCircle2 size={18} />}
        tone="amber"
      />
    </div>
  )
}
