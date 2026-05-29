import PanelAlert from '@/components/panel/shared/PanelAlert'
import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'
import { getDashboardPelangganData } from '@/lib/data/dashboardPelanggan'
import AccountInfoSection from './sections/AccountInfoSection'
import ProfileContactSection from './sections/ProfileContactSection'

export default async function ProfilPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string }
}) {
  const { pelanggan } = await getDashboardPelangganData()
  const tanggalBergabung = pelanggan.tanggal_bergabung
    ? new Date(pelanggan.tanggal_bergabung).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Belum aktif'

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Profil Akun"
        subtitle="Perbarui informasi kontak dan alamat pemasangan Anda."
      />

      {searchParams?.success ? (
        <PanelAlert tone="success">{searchParams.success}</PanelAlert>
      ) : null}
      {searchParams?.error ? (
        <PanelAlert tone="error">{searchParams.error}</PanelAlert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <AccountInfoSection
          pelanggan={pelanggan}
          tanggalBergabung={tanggalBergabung}
        />
        <ProfileContactSection
          noHp={pelanggan.no_hp}
          alamat={pelanggan.alamat_pemasangan}
          latitude={pelanggan.latitude ?? null}
          longitude={pelanggan.longitude ?? null}
        />
      </div>
    </div>
  )
}
