import ReportPageContent from '@/app/admin/laporan/sections/ReportPageContent'
import {
  parseReportMonth,
  parseReportStatus,
  parseReportYear,
  type ReportSearchParams,
} from '@/app/admin/laporan/sections/reportConfig'
import { getLaporanOverview, getLaporanPreview } from '@/lib/data/laporan'

export default async function AdminLaporanPage({
  searchParams,
}: {
  searchParams: ReportSearchParams
}) {
  const filters = {
    bulan: parseReportMonth(searchParams.bulan),
    tahun: parseReportYear(searchParams.tahun),
    status: parseReportStatus(searchParams.status),
  }

  const [overview, preview] = await Promise.all([
    getLaporanOverview(filters),
    getLaporanPreview(filters),
  ])

  return (
    <ReportPageContent
      filters={filters}
      overview={overview}
      preview={preview}
    />
  )
}
