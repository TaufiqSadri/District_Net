import Link from 'next/link'
import { CheckCircle2, Clock3, MessageSquareText, Search, SlidersHorizontal, X } from 'lucide-react'
import AdminTicketTable from '@/app/admin/tiket/sections/AdminTicketTable'
import PanelAlert from '@/components/panel/shared/PanelAlert'
import PanelFilterSelect from '@/components/panel/shared/PanelFilterSelect'
import PanelMetricCard from '@/components/panel/shared/PanelMetricCard'
import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'
import { getAdminTickets, getTicketStats, type TicketStatus } from '@/lib/data/tiket'

interface TicketSearchParams {
  pelanggan?: string
  search?: string
  status?: string
  page?: string
  success?: string
  error?: string
}

const statusOptions = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
]

function parseStatus(value?: string): TicketStatus | 'semua' {
  return value === 'open' || value === 'closed' ? value : 'semua'
}

export default async function AdminTicketPage({
  searchParams,
}: {
  searchParams: TicketSearchParams
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const status = parseStatus(searchParams.status)
  const [stats, result] = await Promise.all([
    getTicketStats(),
    getAdminTickets({
      pelangganId: searchParams.pelanggan,
      search: searchParams.search ?? '',
      status,
      page,
      pageSize: 10,
    }),
  ])

  const hasActiveFilters = Boolean(searchParams.search || searchParams.pelanggan || status !== 'semua')

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Tiket Layanan"
        subtitle="Kelola percakapan helpdesk, jadwal pengecekan, dan perbaikan pelanggan."
      />

      {searchParams.success ? <PanelAlert tone="success">{searchParams.success}</PanelAlert> : null}
      {searchParams.error ? <PanelAlert tone="error">{searchParams.error}</PanelAlert> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PanelMetricCard
          label="Total Tiket"
          value={stats.total}
          sub="Semua tiket"
          icon={<MessageSquareText size={18} />}
          tone="violet"
        />
        <PanelMetricCard
          label="Open"
          value={stats.open}
          sub="Butuh tindak lanjut"
          icon={<Clock3 size={18} />}
          tone="blue"
        />
        <PanelMetricCard
          label="Closed"
          value={stats.closed}
          sub="Sudah ditutup"
          icon={<CheckCircle2 size={18} />}
          tone="emerald"
        />
      </div>

      <TicketFilterBar
        status={status}
        searchParams={searchParams}
        hasActiveFilters={hasActiveFilters}
      />

      <AdminTicketTable result={result} />
    </div>
  )
}

function TicketFilterBar({
  status,
  searchParams,
  hasActiveFilters,
}: {
  status: TicketStatus | 'semua'
  searchParams: TicketSearchParams
  hasActiveFilters: boolean
}) {
  return (
    <form
      action="/admin/tiket"
      className="rounded-[18px] border border-[#e5e7eb] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
    >
      {searchParams.pelanggan ? (
        <input type="hidden" name="pelanggan" value={searchParams.pelanggan} />
      ) : null}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={22}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            name="search"
            defaultValue={searchParams.search ?? ''}
            placeholder="Cari nomor tiket, pelanggan, atau subjek..."
            className="h-12 w-full rounded-xl border-0 bg-[#f1f4fc] pl-12 pr-4 text-[15px] font-normal text-slate-800 outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-[#6741f5]/25"
            type="search"
          />
        </div>

        <PanelFilterSelect
          name="status"
          label="Filter status tiket"
          value={status}
          options={statusOptions}
        />

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] active:scale-[0.98]"
        >
          <SlidersHorizontal size={17} />
          Terapkan
        </button>

        {hasActiveFilters ? (
          <Link
            href="/admin/tiket"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-[15px] font-semibold text-red-600 transition hover:bg-red-50"
          >
            <X size={16} />
            Reset
          </Link>
        ) : null}
      </div>
    </form>
  )
}
