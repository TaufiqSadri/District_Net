import { notFound } from 'next/navigation'
import AdminTicketDetail from '@/app/admin/tiket/sections/AdminTicketDetail'
import PanelAlert from '@/components/panel/shared/PanelAlert'
import { getTicketDetail } from '@/lib/data/tiket'

export default async function AdminTicketDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { success?: string; error?: string }
}) {
  const ticket = await getTicketDetail(params.id)

  if (!ticket) notFound()

  return (
    <div className="space-y-6">
      {searchParams?.success ? <PanelAlert tone="success">{searchParams.success}</PanelAlert> : null}
      {searchParams?.error ? <PanelAlert tone="error">{searchParams.error}</PanelAlert> : null}
      <AdminTicketDetail ticket={ticket} />
    </div>
  )
}
