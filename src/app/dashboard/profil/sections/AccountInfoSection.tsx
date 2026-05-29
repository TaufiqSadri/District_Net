import PanelInfoTile from '@/components/panel/shared/PanelInfoTile'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import type { PelangganWithPaket } from '@/types/database'

interface AccountInfoSectionProps {
  pelanggan: PelangganWithPaket
  tanggalBergabung: string
}

export default function AccountInfoSection({
  pelanggan,
  tanggalBergabung,
}: AccountInfoSectionProps) {
  return (
    <PanelSectionCard title="Informasi Akun">
      <div className="space-y-4">
        <PanelInfoTile label="Nama Lengkap" value={pelanggan.nama_lengkap} />
        <PanelInfoTile label="Email" value={pelanggan.email} />
        <PanelInfoTile
          label="Status Langganan"
          value={pelanggan.status_langganan.replaceAll('_', ' ')}
        />
        <PanelInfoTile label="Tanggal Bergabung" value={tanggalBergabung} />
      </div>
    </PanelSectionCard>
  )
}
