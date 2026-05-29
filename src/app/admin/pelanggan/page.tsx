import { Suspense } from 'react'
import { getPelangganList, getPaketList } from '@/lib/data/pelanggan'
import PageHeader from '@/app/admin/pelanggan/sections/PageHeader'
import SearchFilterBar from '@/app/admin/pelanggan/sections/SearchFilterBar'
import CustomerTable from '@/app/admin/pelanggan/sections/customerTable'
import { CustomerTableSkeleton } from '@/app/admin/pelanggan/sections/customerSkeleton'
import type { StatusLangganan } from '@/types/database'

interface SearchParams {
  search?: string
  status?: string
  paket_id?: string
  sort?: string
  page?: string
  success?: string
  error?: string
}

// ─── Table (isolated Suspense boundary) ──────────────────────────────────────
async function TableSection({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const status = (['aktif', 'ditangguhkan', 'proses_instalasi', 'pending', 'nonaktif'].includes(searchParams.status ?? '')
    ? searchParams.status
    : 'semua') as StatusLangganan | 'semua'

  const result = await getPelangganList({
    search: searchParams.search ?? '',
    status,
    paket_id: searchParams.paket_id ?? 'semua',
    sort: searchParams.sort === 'terlama' ? 'terlama' : 'terbaru',
    page,
    pageSize: 10,
  })

  return (
    <CustomerTable
      rows={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AdminPelangganPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const paketList = await getPaketList()

  return (
    <div className="space-y-6">
      <PageHeader />

      {searchParams.success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {searchParams.success}
        </div>
      ) : null}
      {searchParams.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {searchParams.error}
        </div>
      ) : null}

      <SearchFilterBar paketList={paketList} />

      <Suspense
        key={JSON.stringify(searchParams)}
        fallback={<CustomerTableSkeleton />}
      >
        <TableSection searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
