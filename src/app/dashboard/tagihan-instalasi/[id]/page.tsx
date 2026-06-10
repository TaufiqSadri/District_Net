import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import PanelAlert from '@/components/panel/shared/PanelAlert'
import {
  canSubmitPembayaran,
  getTagihanInstalasiDetailForCurrentPelanggan,
} from '@/lib/data/dashboardPelanggan'
import { getLatestJadwalInstalasiForPelanggan } from '@/lib/data/jadwalInstalasi'
import type { TagihanInstalasi } from '@/types/database'
import InstallationBillDetailSection from './sections/InstallationBillDetailSection'
import InstallationPaymentSection from './sections/InstallationPaymentSection'

export default async function TagihanInstalasiDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { success?: string; error?: string }
}) {
  const detail = await getTagihanInstalasiDetailForCurrentPelanggan(params.id)

  if (!detail) notFound()

  const { instalasi, pembayaran, pelanggan } = detail
  const jadwalInstalasi = await getLatestJadwalInstalasiForPelanggan(pelanggan.id)
  const tagihanInstalasi = instalasi as TagihanInstalasi
  const latestPayment = pembayaran[0]
  const canSubmitPayment = canSubmitPembayaran(tagihanInstalasi.status_tagihan, pembayaran)

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Kembali ke Dashboard
      </Link>

      {searchParams?.success ? (
        <PanelAlert tone="success">{searchParams.success}</PanelAlert>
      ) : null}
      {searchParams?.error ? (
        <PanelAlert tone="error">{searchParams.error}</PanelAlert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <InstallationBillDetailSection
          tagihanInstalasi={tagihanInstalasi}
          jadwalInstalasi={jadwalInstalasi}
          latestPayment={latestPayment}
        />
        <InstallationPaymentSection
          canSubmitPayment={canSubmitPayment}
          userId={pelanggan.user_id}
          instalasiId={tagihanInstalasi.id}
          defaultAmount={tagihanInstalasi.jumlah_tagihan}
          pembayaran={pembayaran}
        />
      </div>
    </div>
  )
}
