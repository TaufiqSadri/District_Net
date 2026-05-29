import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react'
import { deleteKomplainAction, respondKomplainAction } from '@/app/admin/actions'
import AdminAvatar from '@/components/admin/shared/AdminAvatar'
import AdminFilterSelect from '@/components/admin/shared/AdminFilterSelect'
import AdminMetricCard from '@/components/admin/shared/AdminMetricCard'
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader'
import AdminPagination from '@/components/admin/shared/AdminPagination'
import AdminStatusBadge from '@/components/admin/shared/AdminStatusBadge'
import ConfirmActionForm from '@/components/ConfirmActionForm'
import type { KomplainListResult, KomplainStats, KomplainWithPelanggan } from '@/lib/data/komplain'
import {
  complaintSortOptions,
  complaintStatusOptions,
  type ComplaintSearchParams,
} from '@/components/admin/complaints/complaintConfig'

interface ComplaintPageContentProps {
  stats: KomplainStats
  result: KomplainListResult
  page: number
  status: 'semua' | 'menunggu' | 'selesai'
  sort: 'terbaru' | 'terlama'
  searchParams: ComplaintSearchParams
}

export default function ComplaintPageContent({
  stats,
  result,
  page,
  status,
  sort,
  searchParams,
}: ComplaintPageContentProps) {
  const hasActiveFilters = Boolean(
    searchParams.search ||
      searchParams.pelanggan ||
      status !== 'semua' ||
      sort !== 'terbaru',
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kelola Komplain"
        subtitle="Pantau keluhan pelanggan dan berikan respons langsung dari panel admin."
      />

      <FeedbackAlert type="success" message={searchParams.success} />
      <FeedbackAlert type="error" message={searchParams.error} />

      <ComplaintFilterBar
        status={status}
        sort={sort}
        searchParams={searchParams}
        hasActiveFilters={hasActiveFilters}
      />

      <section className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <div className="border-b border-[#e5e7eb] bg-white px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-[#111827]">Daftar Komplain</h2>
              <p className="mt-1 text-[14px] font-normal text-slate-500">
                Respons dan tandai komplain pelanggan langsung dari panel ini.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-slate-50 px-3 py-1.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-100">
              {result.total} data
            </span>
          </div>
        </div>

        {result.data.length === 0 ? (
          <div className="px-6 py-14 text-center text-[14px] font-normal text-slate-500">
            Belum ada komplain untuk ditampilkan.
          </div>
        ) : (
          <div className="space-y-4 p-4 md:p-6">
            {result.data.map((item) => (
              <ComplaintCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <AdminPagination
          basePath="/admin/komplain"
          itemLabel="Komplain"
          currentCount={result.data.length}
          filteredTotal={result.total}
          page={page}
          totalPages={result.totalPages}
          searchParams={{ ...searchParams }}
        />
      </section>
    </div>
  )
}

function FeedbackAlert({
  type,
  message,
}: {
  type: 'success' | 'error'
  message?: string
}) {
  if (!message) return null

  const className =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-red-200 bg-red-50 text-red-700'

  return (
    <div className={`rounded-[18px] border px-4 py-3 text-[14px] font-medium ${className}`}>
      {message}
    </div>
  )
}

function ComplaintFilterBar({
  status,
  sort,
  searchParams,
  hasActiveFilters,
}: {
  status: string
  sort: string
  searchParams: ComplaintSearchParams
  hasActiveFilters: boolean
}) {
  return (
    <form
      action="/admin/komplain"
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
            placeholder="Cari nama, email, atau nomor pelanggan..."
            className="h-12 w-full rounded-xl border-0 bg-[#f1f4fc] pl-12 pr-4 text-[15px] font-normal text-slate-800 outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-[#6741f5]/25"
            type="search"
          />
        </div>

        <AdminFilterSelect
          name="status"
          label="Filter status komplain"
          value={status}
          options={complaintStatusOptions}
        />
        <AdminFilterSelect
          name="sort"
          label="Urutan komplain"
          value={sort}
          options={complaintSortOptions}
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
            href="/admin/komplain"
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

function ComplaintStats({ stats }: { stats: KomplainStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminMetricCard
        label="Total Komplain"
        value={stats.total}
        sub="Semua laporan"
        icon={<MessageSquareText size={18} />}
        tone="slate"
      />
      <AdminMetricCard
        label="Menunggu"
        value={stats.menunggu}
        sub="Perlu respons"
        icon={<Clock3 size={18} />}
        tone="amber"
      />
      <AdminMetricCard
        label="Selesai"
        value={stats.selesai}
        sub="Sudah ditutup"
        icon={<CheckCircle2 size={18} />}
        tone="emerald"
      />
      <AdminMetricCard
        label="Belum Direspons"
        value={stats.belumDirespons}
        sub="Kotak masuk baru"
        icon={<AlertCircle size={18} />}
        tone="red"
      />
    </div>
  )
}

function ComplaintCard({ item }: { item: KomplainWithPelanggan }) {
  const action = respondKomplainAction.bind(null, item.id)
  const deleteAction = deleteKomplainAction.bind(null, item.id)

  return (
    <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <AdminAvatar name={item.pelanggan?.nama_lengkap} />
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold text-[#111827]">
                {item.pelanggan?.nama_lengkap ?? 'Pelanggan tidak diketahui'}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-normal text-slate-500">
                {item.pelanggan?.email ?? '-'} {item.pelanggan?.no_hp ? `- ${item.pelanggan.no_hp}` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AdminStatusBadge tone={item.status ? 'emerald' : 'amber'}>
            {item.status ? 'Selesai' : 'Menunggu'}
          </AdminStatusBadge>
          <span className="text-[13px] font-normal text-slate-500">
            {item.tanggal ? new Date(item.tanggal).toLocaleString('id-ID') : '-'}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-[#f8faff] px-4 py-4 text-[14px] leading-6 text-slate-700">
        {item.isi_komplain}
      </div>

      <form action={action} className="mt-4 space-y-3">
        <textarea
          name="respon_admin"
          defaultValue={item.respon_admin ?? ''}
          rows={3}
          placeholder="Tulis respons admin..."
          className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-600">
            <input
              type="checkbox"
              name="selesai"
              value="true"
              defaultChecked={!!item.status}
              className="h-4 w-4 rounded border-slate-300 text-[#6741f5] focus:ring-[#6741f5]"
            />
            Tandai selesai
          </label>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] active:scale-[0.98]"
          >
            <Send size={15} />
            Simpan Respons
          </button>
        </div>
      </form>

      <div className="mt-3 flex justify-end">
        <ConfirmActionForm
          action={deleteAction}
          itemName={`${item.pelanggan?.nama_lengkap ?? 'Pelanggan tidak diketahui'} - ${item.isi_komplain.slice(0, 60)}`}
          title="Konfirmasi Hapus Komplain"
          message="Komplain ini akan dihapus permanen."
          confirmLabel="Ya, Hapus"
        >
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-[14px] font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={15} />
            Hapus
          </button>
        </ConfirmActionForm>
      </div>
    </article>
  )
}
