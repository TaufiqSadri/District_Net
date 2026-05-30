import { notFound, redirect } from 'next/navigation'
import CustomerTicketDetail from '@/app/dashboard/tiket/sections/CustomerTicketDetail'
import PanelAlert from '@/components/panel/shared/PanelAlert'
import { getCurrentPelanggan } from '@/lib/data/pelanggan'
import { getTicketDetail } from '@/lib/data/tiket'

export default async function DashboardTicketDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { success?: string; error?: string }
}) {
  const pelanggan = await getCurrentPelanggan()
  if (!pelanggan) redirect('/login')
  if (pelanggan.status_langganan === 'pending') redirect('/dashboard/pending')
  if (pelanggan.status_langganan === 'nonaktif') redirect('/dashboard/nonaktif')

  const ticket = await getTicketDetail(params.id, pelanggan.id)

  if (!ticket) notFound()

  return (
    <div className="space-y-6">
      {searchParams?.success ? <PanelAlert tone="success">{searchParams.success}</PanelAlert> : null}
      {searchParams?.error ? <PanelAlert tone="error">{searchParams.error}</PanelAlert> : null}
      <CustomerTicketDetail ticket={ticket} />
    </div>
  )
}
