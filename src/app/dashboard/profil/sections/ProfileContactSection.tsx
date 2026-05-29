import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import ProfilForm from '../ProfilForm'

interface ProfileContactSectionProps {
  noHp: string
  alamat: string
  latitude: number | null
  longitude: number | null
}

export default function ProfileContactSection({
  noHp,
  alamat,
  latitude,
  longitude,
}: ProfileContactSectionProps) {
  return (
    <PanelSectionCard
      title="Perbarui Data Kontak"
      subtitle="Klik Pilih di Peta atau Gunakan GPS untuk memperbarui titik lokasi pemasangan."
    >
      <ProfilForm
        noHp={noHp}
        alamat={alamat}
        latitude={latitude}
        longitude={longitude}
      />
    </PanelSectionCard>
  )
}
