import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import CreateTicketForm from '@/app/dashboard/tiket/sections/CreateTicketForm'
import CustomerTicketTable from '@/app/dashboard/tiket/sections/CustomerTicketTable'
import PanelAlert from '@/components/panel/shared/PanelAlert'
import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'
import { getCurrentPelanggan } from '@/lib/data/pelanggan'
import { getCustomerTickets } from '@/lib/data/tiket'
import { redirect } from 'next/navigation'

export default async function DashboardTicketPage({
  searchParams,
}: {
  searchParams?: { page?: string; success?: string; error?: string }
}) {
  const pelanggan = await getCurrentPelanggan()
  if (!pelanggan) redirect('/login')
  if (pelanggan.status_langganan === 'pending') redirect('/dashboard/pending')
  if (pelanggan.status_langganan === 'nonaktif') redirect('/dashboard/nonaktif')

  const page = Math.max(1, parseInt(searchParams?.page ?? '1', 10))
  const result = await getCustomerTickets({
    pelangganId: pelanggan.id,
    page,
    pageSize: 10,
  })

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Tiket Layanan"
        subtitle="Buat tiket bantuan dan ikuti percakapan dengan tim District Net."
        action={
          <Link
            href="#buat-tiket"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6]"
          >
            <PlusCircle size={16} />
            Buat Tiket Baru
          </Link>
        }
      />

      {searchParams?.success ? <PanelAlert tone="success">{searchParams.success}</PanelAlert> : null}
      {searchParams?.error ? <PanelAlert tone="error">{searchParams.error}</PanelAlert> : null}

      <CustomerTicketTable result={result} />
      <CreateTicketForm />
    </div>
  )
}
