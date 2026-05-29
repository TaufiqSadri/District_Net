import PanelAlert from '@/components/panel/shared/PanelAlert'
import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'
import { getDashboardPelangganData } from '@/lib/data/dashboardPelanggan'
import ComplaintFormSection from './sections/ComplaintFormSection'
import ComplaintHistorySection from './sections/ComplaintHistorySection'

export default async function KomplainPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string }
}) {
  const { komplain } = await getDashboardPelangganData()

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Komplain"
        subtitle="Sampaikan kendala layanan agar tim admin bisa segera menindaklanjuti."
      />

      {searchParams?.success ? (
        <PanelAlert tone="success">{searchParams.success}</PanelAlert>
      ) : null}
      {searchParams?.error ? (
        <PanelAlert tone="error">{searchParams.error}</PanelAlert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <ComplaintFormSection />
        <ComplaintHistorySection komplain={komplain} />
      </div>
    </div>
  )
}
