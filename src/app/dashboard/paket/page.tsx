import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'
import { getDashboardPelangganData } from '@/lib/data/dashboardPelanggan'
import AvailablePackagesSection from './sections/AvailablePackagesSection'
import CurrentPackageSection from './sections/CurrentPackageSection'

export default async function PaketPage() {
  const { pelanggan, paketAktif } = await getDashboardPelangganData()
  const paketSaatIni = pelanggan.paket_internet

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Paket Internet"
        subtitle="Lihat detail paket aktif Anda dan bandingkan dengan paket lain yang tersedia."
      />
      <CurrentPackageSection paket={paketSaatIni} />
      <AvailablePackagesSection
        paketAktif={paketAktif}
        currentPackageId={paketSaatIni?.id}
      />
    </div>
  )
}
