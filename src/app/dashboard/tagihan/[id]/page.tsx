import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import PanelAlert from '@/components/panel/shared/PanelAlert'
import { getTagihanDetailForCurrentPelanggan } from '@/lib/data/dashboardPelanggan'
import MonthlyBillDetailSection from './sections/MonthlyBillDetailSection'
import MonthlyPaymentSection from './sections/MonthlyPaymentSection'

export default async function TagihanDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { success?: string; error?: string }
}) {
  const detail = await getTagihanDetailForCurrentPelanggan(params.id)

  if (!detail) notFound()

  const { tagihan, pembayaran } = detail
  const latestPayment = pembayaran[0]
  const canSubmitPayment = tagihan.status_tagihan === 'belum_bayar'

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/tagihan"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Kembali ke Tagihan
      </Link>

      {searchParams?.success ? (
        <PanelAlert tone="success">{searchParams.success}</PanelAlert>
      ) : null}
      {searchParams?.error ? (
        <PanelAlert tone="error">{searchParams.error}</PanelAlert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <MonthlyBillDetailSection
          tagihan={tagihan}
          latestPayment={latestPayment}
        />
        <MonthlyPaymentSection
          canSubmitPayment={canSubmitPayment}
          userId={detail.pelanggan.user_id}
          tagihanId={tagihan.id}
          defaultAmount={tagihan.jumlah_tagihan}
          pembayaran={pembayaran}
        />
      </div>
    </div>
  )
}
