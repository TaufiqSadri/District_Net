import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  BarChart2,
  CheckCircle2,
  Download,
  Filter,
  ReceiptText,
  ShieldAlert,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import AdminFilterSelect from '@/components/admin/shared/AdminFilterSelect'
import AdminMetricCard from '@/components/admin/shared/AdminMetricCard'
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader'
import AdminPreviewCard from '@/components/admin/shared/AdminPreviewCard'
import AdminSectionTitle from '@/components/admin/shared/AdminSectionTitle'
import { formatRupiah } from '@/lib/data/dashboardPelanggan'
import type { LaporanFilters, LaporanOverview } from '@/lib/data/laporan'
import {
  monthNamesShort,
  monthOptions,
  reportExportOptions,
  reportStatusOptions,
  type ReportSearchParams,
  yearOptions,
} from '@/components/admin/reports/reportConfig'

interface ReportPreviewData {
  tagihan: any[]
  pembayaran: any[]
  komplain: any[]
}

interface ReportPageContentProps {
  filters: LaporanFilters
  overview: LaporanOverview
  preview: ReportPreviewData
}

export default function ReportPageContent({
  filters,
  overview,
  preview,
}: ReportPageContentProps) {
  const hasActiveFilters = Boolean(filters.bulan || filters.tahun || filters.status)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Laporan"
        subtitle="Ringkasan operasional, review data terbaru, dan export laporan admin."
      />

      <ReportFilterBar filters={filters} hasActiveFilters={hasActiveFilters} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Pelanggan Aktif"
          value={overview.pelangganAktif}
          sub={`${overview.totalPelanggan} total pelanggan`}
          icon={<Users size={18} />}
          tone="violet"
        />
        <AdminMetricCard
          label="Tagihan Lunas"
          value={overview.tagihanLunas}
          sub={`${overview.totalTagihan} total tagihan`}
          icon={<CheckCircle2 size={18} />}
          tone="emerald"
        />
        <AdminMetricCard
          label="Menunggu Verifikasi"
          value={overview.tagihanMenungguVerifikasi}
          sub="Perlu dicek admin"
          icon={<ShieldAlert size={18} />}
          tone="amber"
        />
        <AdminMetricCard
          label="Komplain Menunggu"
          value={overview.komplainMenunggu}
          sub={`${overview.totalKomplain} total komplain`}
          icon={<AlertCircle size={18} />}
          tone="red"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[18px] border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
          <AdminSectionTitle
            icon={<WalletCards size={19} />}
            title="Review Keuangan"
            subtitle="Ringkasan pendapatan dan tagihan berdasarkan filter aktif."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ReviewMetric label="Pendapatan Terverifikasi" value={formatRupiah(overview.totalPendapatanTerverifikasi)} tone="emerald" />
            <ReviewMetric label="Total Tunggakan" value={formatRupiah(overview.totalTunggakan)} tone="red" />
            <ReviewMetric label="Pelanggan Pending" value={overview.pelangganPending} tone="amber" />
            <ReviewMetric label="Pelanggan Ditangguhkan" value={overview.pelangganDitangguhkan} tone="orange" />
            <ReviewMetric label="Proses Instalasi" value={overview.pelangganProsesInstalasi} tone="blue" />
            <ReviewMetric label="Pelanggan Nonaktif" value={overview.pelangganNonaktif} tone="slate" />
          </div>
        </section>

        <section className="rounded-[18px] border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
          <AdminSectionTitle
            icon={<TrendingUp size={19} />}
            title="Review Operasional"
            subtitle="Sinyal pekerjaan yang membutuhkan perhatian admin."
          />
          <div className="mt-5 space-y-3 text-[14px] leading-6 text-slate-600">
            <OperationalNote>
              Ada <span className="font-semibold text-[#111827]">{overview.tagihanBelumBayar}</span> tagihan belum dibayar di luar yang sedang diverifikasi.
            </OperationalNote>
            <OperationalNote>
              Ada <span className="font-semibold text-[#111827]">{overview.tagihanMenungguVerifikasi}</span> pembayaran yang sedang menunggu pemeriksaan admin.
            </OperationalNote>
            <OperationalNote>
              Ada <span className="font-semibold text-[#111827]">{overview.komplainMenunggu}</span> komplain pelanggan yang belum selesai.
            </OperationalNote>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPreviewCard
          title="Tagihan Terbaru"
          icon={<ReceiptText size={18} />}
          items={preview.tagihan.map((item) => ({
            id: item.id,
            title: item.pelanggan?.nama_lengkap ?? '-',
            description: `${monthNamesShort[item.bulan - 1]} ${item.tahun} - ${formatRupiah(item.jumlah_tagihan)}`,
          }))}
          emptyText="Belum ada tagihan terbaru."
        />

        <AdminPreviewCard
          title="Pembayaran Terbaru"
          icon={<WalletCards size={18} />}
          items={preview.pembayaran.map((item) => ({
            id: item.id,
            title: item.tagihan?.pelanggan?.nama_lengkap ?? '-',
            description: `${item.tagihan ? `${monthNamesShort[item.tagihan.bulan - 1]} ${item.tagihan.tahun}` : '-'} - ${formatRupiah(item.jumlah_bayar)}`,
          }))}
          emptyText="Belum ada pembayaran terbaru."
        />

        <AdminPreviewCard
          title="Komplain Terbaru"
          icon={<BarChart2 size={18} />}
          items={preview.komplain.map((item) => ({
            id: item.id,
            title: item.pelanggan?.nama_lengkap ?? '-',
            description: item.isi_komplain,
          }))}
          emptyText="Belum ada komplain terbaru."
        />
      </div>
    </div>
  )
}

function ReportFilterBar({
  filters,
  hasActiveFilters,
}: {
  filters: LaporanFilters
  hasActiveFilters: boolean
}) {
  const hiddenFilters: ReportSearchParams = {
    bulan: filters.bulan ? String(filters.bulan) : undefined,
    tahun: filters.tahun ? String(filters.tahun) : undefined,
    status: filters.status ?? undefined,
  }

  return (
    <section className="rounded-[18px] border border-[#e5e7eb] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center">
        <form action="/admin/laporan" className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="flex h-12 items-center gap-2 rounded-xl bg-[#f8faff] px-4 text-[15px] font-semibold text-slate-700">
            <Filter size={17} className="text-[#6741f5]" />
            Filter Laporan
          </div>

          <AdminFilterSelect
            name="bulan"
            label="Filter bulan laporan"
            value={filters.bulan ? String(filters.bulan) : 'semua'}
            options={monthOptions}
            widthClass="lg:w-[170px]"
          />
          <AdminFilterSelect
            name="tahun"
            label="Filter tahun laporan"
            value={filters.tahun ? String(filters.tahun) : 'semua'}
            options={yearOptions}
            widthClass="lg:w-[150px]"
          />
          <AdminFilterSelect
            name="status"
            label="Filter status tagihan"
            value={filters.status ?? 'semua'}
            options={reportStatusOptions}
            widthClass="lg:w-[210px]"
          />

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] active:scale-[0.98]"
          >
            Terapkan
          </button>
          {hasActiveFilters ? (
            <Link
              href="/admin/laporan"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-[15px] font-semibold text-red-600 transition hover:bg-red-50"
            >
              <X size={16} />
              Reset
            </Link>
          ) : null}
        </form>

        <form action="/admin/laporan/export" method="get" className="flex w-full flex-col gap-3 sm:flex-row xl:ml-auto xl:w-auto">
          {hiddenFilters.bulan ? <input type="hidden" name="bulan" value={hiddenFilters.bulan} /> : null}
          {hiddenFilters.tahun ? <input type="hidden" name="tahun" value={hiddenFilters.tahun} /> : null}
          {hiddenFilters.status ? <input type="hidden" name="status" value={hiddenFilters.status} /> : null}
          <AdminFilterSelect
            name="type"
            label="Jenis export laporan"
            value="tagihan"
            options={reportExportOptions.map((item) => ({ value: item.type, label: item.label }))}
            widthClass="sm:w-[170px]"
            light
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-5 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={17} className="text-[#6741f5]" />
            Export PDF
          </button>
        </form>
      </div>
    </section>
  )
}

function ReviewMetric({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone: 'emerald' | 'red' | 'amber' | 'orange' | 'blue' | 'slate'
}) {
  const toneClass = {
    emerald: 'text-emerald-700',
    red: 'text-red-600',
    amber: 'text-amber-700',
    orange: 'text-orange-700',
    blue: 'text-blue-700',
    slate: 'text-slate-700',
  }[tone]

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8faff] p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-[17px] font-semibold ${toneClass}`}>{value}</p>
    </div>
  )
}

function OperationalNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8faff] px-4 py-3">
      {children}
    </div>
  )
}
