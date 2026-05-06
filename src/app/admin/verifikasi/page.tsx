import { Suspense } from 'react'
import { getPendingPembayaran, getVerificationStats } from '@/lib/data/pembayaran'
import VerificationStats from '@/components/admin/verification/verificationStats'
import VerificationFilters from '@/components/admin/verification/verificationFilters'
import VerificationTable from '@/components/admin/verification/verificationTable'

interface SearchParams {
  search?: string
  sort?: string
  page?: string
}

// ─── Stats skeleton ───────────────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-start justify-between">
            <div className="h-2.5 w-28 animate-pulse rounded-md bg-gray-100" />
            <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100" />
          </div>
          <div className="h-8 w-12 animate-pulse rounded-md bg-gray-100" />
          <div className="mt-1 h-2.5 w-24 animate-pulse rounded-md bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

// ─── Table skeleton ───────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-card overflow-hidden">
      <div className="hidden lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Pelanggan', 'Periode', 'Nominal', 'Tanggal Upload', 'Bukti', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="px-5 pb-3 pt-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 animate-pulse rounded-md bg-gray-100" />
                      <div className="h-2.5 w-20 animate-pulse rounded-md bg-gray-100" />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><div className="h-3.5 w-20 animate-pulse rounded-md bg-gray-100" /></td>
                <td className="px-5 py-4"><div className="h-3.5 w-28 animate-pulse rounded-md bg-gray-100" /></td>
                <td className="px-5 py-4"><div className="h-3.5 w-24 animate-pulse rounded-md bg-gray-100" /></td>
                <td className="px-5 py-4"><div className="h-6 w-14 animate-pulse rounded-lg bg-gray-100" /></td>
                <td className="px-5 py-4"><div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" /></td>
                <td className="px-5 py-4 text-right"><div className="ml-auto h-8 w-8 animate-pulse rounded-lg bg-gray-100" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Stats section ────────────────────────────────────────────────────────────
async function StatsSection() {
  const stats = await getVerificationStats()
  return <VerificationStats stats={stats} />
}

// ─── Table section ────────────────────────────────────────────────────────────
async function TableSection({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const result = await getPendingPembayaran({
    search: searchParams.search ?? '',
    sort: searchParams.sort === 'terlama' ? 'terlama' : 'terbaru',
    page,
    pageSize: 10,
  })

  return (
    <VerificationTable
      rows={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AdminVerifikasiPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Verifikasi Pembayaran</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pengajuan pembayaran pelanggan yang menunggu verifikasi
        </p>
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Filters */}
      <VerificationFilters />

      {/* Table */}
      <Suspense key={JSON.stringify(searchParams)} fallback={<TableSkeleton />}>
        <TableSection searchParams={searchParams} />
      </Suspense>
    </div>
  )
}