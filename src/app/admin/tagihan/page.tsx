import BillingPageContent from '@/app/admin/tagihan/sections/BillingPageContent'

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
  return <BillingPageContent searchParams={searchParams} />
}
