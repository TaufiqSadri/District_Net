import ComplaintPageContent from '@/app/admin/komplain/sections/ComplaintPageContent'
import {
  type ComplaintSearchParams,
  parseComplaintSort,
  parseComplaintStatus,
} from '@/app/admin/komplain/sections/complaintConfig'
import { getAllKomplain, getKomplainStats } from '@/lib/data/komplain'

export default async function AdminKomplainPage({
  searchParams,
}: {
  searchParams: ComplaintSearchParams
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const status = parseComplaintStatus(searchParams.status)
  const sort = parseComplaintSort(searchParams.sort)

  const [stats, result] = await Promise.all([
    getKomplainStats(),
    getAllKomplain({
      pelangganId: searchParams.pelanggan,
      search: searchParams.search ?? '',
      status,
      sort,
      page,
      pageSize: 10,
    }),
  ])

  return (
    <ComplaintPageContent
      stats={stats}
      result={result}
      page={page}
      status={status}
      sort={sort}
      searchParams={searchParams}
    />
  )
}
