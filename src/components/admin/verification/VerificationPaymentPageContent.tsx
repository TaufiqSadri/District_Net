import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPembayaranList } from '@/lib/data/pembayaran'
import SearchFilterBar from '@/components/admin/verification/SearchFilterBar'
import VerificationPaymentTable from '@/components/admin/verification/VerificationPaymentTable'
import type { InvoiceLookup } from '@/components/admin/verification/VerificationPaymentRow'
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader'

interface SearchParams extends Record<string, string | undefined> {
  pelanggan?: string
  search?: string
  status?: string
  sort?: string
  page?: string
}

interface VerificationPaymentPageContentProps {
  searchParams: SearchParams
}

async function TableSection({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const status =
    searchParams.status === 'menunggu' ||
    searchParams.status === 'diterima' ||
    searchParams.status === 'ditolak'
      ? searchParams.status
      : 'semua'

  const result = await getPembayaranList({
    pelangganId: searchParams.pelanggan,
    search: searchParams.search ?? '',
    status,
    sort: searchParams.sort === 'terlama' ? 'terlama' : 'terbaru',
    page,
    pageSize: 10,
  })
  const invoiceMap = await getInvoiceMap(result.data.map((row) => row.id))

  return (
    <VerificationPaymentTable
      rows={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      invoiceMap={invoiceMap}
    />
  )
}

export default function VerificationPaymentPageContent({
  searchParams,
}: VerificationPaymentPageContentProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader 
      title='Verifikasi Pembayaran'
      subtitle='Semua pembayaran pelanggan ditampilkan disini. Diurutkan secara default.'
      />

      <SearchFilterBar />

      <Suspense key={JSON.stringify(searchParams)} fallback={<VerificationTableSkeleton />}>
        <TableSection searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function getInvoiceMap(paymentIds: string[]) {
  const invoiceMap: Record<string, InvoiceLookup> = {}

  if (paymentIds.length === 0) return invoiceMap

  const admin = createAdminClient()
  const { data } = await admin
    .from('invoice')
    .select('id, pembayaran_id, pdf_url')
    .in('pembayaran_id', paymentIds)

  for (const invoice of data ?? []) {
    invoiceMap[invoice.pembayaran_id] = {
      id: invoice.id,
      pdf_url: invoice.pdf_url,
    }
  }

  return invoiceMap
}

function VerificationTableSkeleton() {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="hidden lg:block">
        <div className="grid grid-cols-[1.85fr_1fr_1fr_1fr_0.8fr_1fr_0.6fr] bg-[#f7f9fe] px-8 py-5">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-3 w-20 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.85fr_1fr_1fr_1fr_0.8fr_1fr_0.6fr] border-t border-[#e5e7eb] px-8 py-5"
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
        <div className="h-5 w-56 animate-pulse rounded bg-slate-100" />
      </div>
    </section>
  )
}
