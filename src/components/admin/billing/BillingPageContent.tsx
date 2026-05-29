import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import {
  getAllTagihan,
  getAllTagihanInstalasi,
  type TagihanStatus,
} from '@/lib/data/tagihan'
import BillingTabs, { type BillingTabKey } from '@/components/admin/billing/BillingTabs'
import SearchFilterBar from '@/components/admin/billing/SearchFilterBar'
import BillingTable from '@/components/admin/billing/billingTable'

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

interface BillingPageContentProps {
  searchParams: SearchParams
}

const validStatuses: TagihanStatus[] = [
  'belum_bayar',
  'menunggu_verifikasi',
  'lunas',
  'overdue',
]

async function TableSection({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const status = validStatuses.includes(searchParams.status as TagihanStatus)
    ? (searchParams.status as TagihanStatus)
    : 'semua'
  const activeTab = getActiveTab(searchParams)

  if (activeTab === 'instalasi') {
    const result = await getAllTagihanInstalasi({
      pelangganId: searchParams.pelanggan,
      search: searchParams.search ?? '',
      status,
      sort: searchParams.sort === 'terlama' ? 'terlama' : 'terbaru',
      page,
      pageSize: 10,
    })

    return (
      <BillingTable
        variant="instalasi"
        rows={result.data}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
      />
    )
  }

  const result = await getAllTagihan({
    pelangganId: searchParams.pelanggan,
    search: searchParams.search ?? '',
    bulan: searchParams.bulan ?? 'semua',
    tahun: searchParams.tahun ?? 'semua',
    status,
    sort: searchParams.sort === 'terlama' ? 'terlama' : 'terbaru',
    page,
    pageSize: 10,
  })

  return (
    <BillingTable
      rows={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
    />
  )
}

export default function BillingPageContent({
  searchParams,
}: BillingPageContentProps) {
  const activeTab = getActiveTab(searchParams)
  const isInstallation = activeTab === 'instalasi'

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-slate-900 sm:text-[30px]">
            Kelola Tagihan
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] font-normal leading-6 text-slate-600">
            Manajemen data pelanggan dan status layanan internet di seluruh distrik.
          </p>
        </div>

        <Link
          href={isInstallation ? '/admin/tagihan/generate?jenis=instalasi' : '/admin/tagihan/generate'}
          className="inline-flex h-[52px] items-center justify-center gap-3 rounded-xl bg-[#6440f3] px-6 py-3 text-[16px] font-semibold text-white shadow-[0_10px_22px_rgba(100,64,243,0.28)] transition hover:bg-[#5834e5] active:scale-[0.98] sm:min-w-[260px]"
        >
          <Plus size={18} />
          {isInstallation ? 'Buat Tagihan Instalasi' : 'Buat Tagihan Bulanan'}
        </Link>
      </section>

      <BillingTabs activeTab={activeTab} searchParams={searchParams} />
      <SearchFilterBar />

      <Suspense key={JSON.stringify(searchParams)} fallback={<BillingTableSkeleton />}>
        <TableSection searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function getActiveTab(searchParams: SearchParams): BillingTabKey {
  return searchParams.jenis === 'instalasi' ? 'instalasi' : 'bulanan'
}

function BillingTableSkeleton() {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="hidden lg:block">
        <div className="grid grid-cols-[1.7fr_1fr_1fr_1.1fr_1.15fr_0.8fr_0.5fr] bg-[#f7f9fe] px-8 py-5">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-3 w-20 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.7fr_1fr_1fr_1.1fr_1.15fr_0.8fr_0.5fr] border-t border-[#e5e7eb] px-8 py-5"
          >
            {Array.from({ length: 7 }).map((__, childIndex) => (
              <div
                key={childIndex}
                className="h-5 w-24 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="space-y-4 p-5 lg:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="border-t border-[#e5e7eb] px-6 py-5">
        <div className="h-5 w-52 animate-pulse rounded bg-slate-100" />
      </div>
    </section>
  )
}
