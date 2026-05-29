import BillingPageContent from '@/components/admin/billing/BillingPageContent'
import { syncSuspendedPelangganStatuses } from '@/lib/data/pelangganStatus'

interface SearchParams extends Record<string, string | undefined> {
  pelanggan?: string
  search?: string
  bulan?: string
  tahun?: string
  status?: string
  sort?: string
  page?: string
  jenis?: string
}

export default async function AdminTagihanPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  await syncSuspendedPelangganStatuses()

  return <BillingPageContent searchParams={searchParams} />
}
