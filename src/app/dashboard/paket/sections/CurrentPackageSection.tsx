import { CheckCircle2, Wifi } from 'lucide-react'
import PanelInfoTile from '@/components/panel/shared/PanelInfoTile'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { formatRupiah } from '@/lib/data/dashboardPelanggan'
import type { PaketInternet } from '@/types/database'

interface CurrentPackageSectionProps {
  paket: PaketInternet | null
}

export default function CurrentPackageSection({ paket }: CurrentPackageSectionProps) {
  return (
    <PanelSectionCard
      title="Paket Anda Saat Ini"
      subtitle="Informasi paket yang sedang digunakan pada alamat pemasangan Anda."
      action={
        <PanelStatusBadge tone={paket ? 'emerald' : 'amber'} icon={<CheckCircle2 size={13} />}>
          {paket ? 'Aktif' : 'Belum Terhubung'}
        </PanelStatusBadge>
      }
    >
      {paket ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <PanelInfoTile label="Nama Paket" value={paket.nama_paket} />
            <PanelInfoTile label="Kecepatan" value={`${paket.kecepatan_mbps} Mbps`} />
            <PanelInfoTile label="Biaya Bulanan" value={formatRupiah(paket.harga)} />
          </div>
          {paket.deskripsi ? (
            <div className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-4 text-[14px] leading-6 text-slate-600">
              {paket.deskripsi}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800">
          Paket untuk akun Anda belum terhubung. Silakan hubungi admin.
        </div>
      )}
    </PanelSectionCard>
  )
}
