import VerificationPaymentPageContent from '@/app/admin/verifikasi/sections/VerificationPaymentPageContent'

interface SearchParams extends Record<string, string | undefined> {
  pelanggan?: string
  search?: string
  status?: string
  sort?: string
  page?: string
}

export default async function AdminVerifikasiPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return <VerificationPaymentPageContent searchParams={searchParams} />
}
