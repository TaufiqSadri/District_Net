import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock,
  Hammer,
  MapPin,
  Phone,
  Save,
  SlidersHorizontal,
  User,
  Wrench,
  XCircle,
} from 'lucide-react'
import { updateJadwalInstalasiAction } from '@/app/admin/actions'
import AdminAvatar from '@/components/admin/shared/AdminAvatar'
import AdminFieldLabel from '@/components/admin/shared/AdminFieldLabel'
import AdminFilterSelect from '@/components/admin/shared/AdminFilterSelect'
import AdminInfoTile from '@/components/admin/shared/AdminInfoTile'
import AdminMetricCard from '@/components/admin/shared/AdminMetricCard'
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader'
import AdminStatusBadge from '@/components/admin/shared/AdminStatusBadge'
import type { JadwalInstalasiWithRelations } from '@/lib/data/jadwalInstalasi'
import type { StatusJadwalInstalasi } from '@/types/database'
import {
  labelScheduleStatus,
  scheduleStatusOptions,
  scheduleStatusTone,
} from '@/components/admin/schedule/scheduleConfig'

interface InstallationSchedulePageContentProps {
  rows: JadwalInstalasiWithRelations[]
  status: StatusJadwalInstalasi | 'semua'
}

export default function InstallationSchedulePageContent({
  rows,
  status,
}: InstallationSchedulePageContentProps) {
  const menunggu = rows.filter((row) => row.status === 'menunggu_jadwal').length
  const terjadwal = rows.filter((row) => row.status === 'terjadwal').length
  const dikerjakan = rows.filter((row) => row.status === 'dikerjakan').length
  const selesai = rows.filter((row) => row.status === 'selesai').length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Jadwal Instalasi"
        subtitle="Kelola jadwal pemasangan setelah pembayaran instalasi diverifikasi."
        action={<ScheduleFilter status={status} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Menunggu Jadwal"
          value={menunggu}
          sub="Perlu diatur"
          icon={<Clock size={18} />}
          tone="amber"
        />
        <AdminMetricCard
          label="Terjadwal"
          value={terjadwal}
          sub="Sudah punya tanggal"
          icon={<CalendarClock size={18} />}
          tone="blue"
        />
        <AdminMetricCard
          label="Dikerjakan"
          value={dikerjakan}
          sub="Dalam proses"
          icon={<Hammer size={18} />}
          tone="violet"
        />
        <AdminMetricCard
          label="Selesai"
          value={selesai}
          sub="Pelanggan aktif"
          icon={<CheckCircle2 size={18} />}
          tone="emerald"
        />
      </div>

      <section className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <div className="border-b border-[#e5e7eb] bg-white px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-[#111827]">Daftar Jadwal</h2>
              <p className="mt-1 text-[14px] font-normal text-slate-500">
                Tandai selesai hanya saat pemasangan benar-benar selesai.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-100">
              <Wrench size={15} className="text-[#6741f5]" />
              {rows.length} jadwal
            </span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center text-[14px] font-normal text-slate-500">
            Belum ada jadwal instalasi.
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-6">
            {rows.map((row) => (
              <ScheduleRow key={row.id} row={row} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ScheduleFilter({ status }: { status: StatusJadwalInstalasi | 'semua' }) {
  return (
    <form
      action="/admin/jadwal-instalasi"
      className="flex w-full flex-col gap-3 rounded-[18px] border border-[#e5e7eb] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:w-auto sm:min-w-[360px] sm:flex-row"
    >
      <AdminFilterSelect
        name="status"
        label="Filter status jadwal"
        value={status}
        options={scheduleStatusOptions}
        widthClass="min-w-0 flex-1"
      />
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.22)] transition hover:bg-[#5b2fd6] active:scale-[0.98]"
      >
        <SlidersHorizontal size={17} />
        Terapkan
      </button>
    </form>
  )
}

function ScheduleRow({ row }: { row: JadwalInstalasiWithRelations }) {
  const action = updateJadwalInstalasiAction.bind(null, row.id)
  const paket = row.pelanggan?.paket_internet
    ? `${row.pelanggan.paket_internet.nama_paket} ${row.pelanggan.paket_internet.kecepatan_mbps} Mbps`
    : 'Paket belum tersedia'
  const detailId = `jadwal-detail-${row.id}`

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <input id={detailId} type="checkbox" className="peer sr-only" />

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(210px,1.15fr)_minmax(170px,0.8fr)_minmax(150px,0.72fr)_minmax(160px,0.8fr)_minmax(300px,1.08fr)_auto] xl:items-center peer-checked:[&_.jadwal-chevron]:rotate-180">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <AdminAvatar name={row.pelanggan?.nama_lengkap} />
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold text-[#111827]">
                {row.pelanggan?.nama_lengkap ?? '-'}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-medium text-[#6741f5]">{paket}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ScheduleStatusBadge status={row.status} />
            <span className="text-[13px] font-normal text-slate-500">
              {formatDateTime(row.tanggal_pemasangan)}
            </span>
          </div>
        </div>

        <AdminInfoTile label="Kontak Pelanggan" value={row.pelanggan?.no_hp ?? '-'} />
        <AdminInfoTile label="Teknisi" value={row.teknisi ?? 'Belum ditentukan'} />
        <AdminInfoTile label="No. HP Teknisi" value={row.no_hp_teknisi ?? 'Belum tersedia'} />

        <form action={action} className="rounded-xl bg-[#f8faff] px-4 py-3">
          <input type="hidden" name="tanggal_pemasangan" value={toDateInput(row.tanggal_pemasangan)} />
          <input type="hidden" name="jam_pemasangan" value={toTimeInput(row.tanggal_pemasangan)} />
          <input type="hidden" name="teknisi" value={row.teknisi ?? ''} />
          <input type="hidden" name="no_hp_teknisi" value={row.no_hp_teknisi ?? ''} />
          <input type="hidden" name="catatan" value={row.catatan ?? ''} />
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Ubah Status
          </label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <select
              name="status"
              defaultValue={row.status}
              className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] font-medium text-slate-800 outline-none transition focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
            >
              {scheduleStatusOptions.filter((item) => item.value !== 'semua').map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-4 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#5b2fd6] active:scale-[0.98]"
            >
              <Save size={15} />
              Simpan
            </button>
          </div>
        </form>

        <label
          htmlFor={detailId}
          className="grid h-11 w-11 cursor-pointer place-items-center justify-self-end rounded-xl border border-[#e5e7eb] bg-white text-slate-500 transition hover:border-[#6741f5]/40 hover:text-[#6741f5]"
          aria-label={`Buka detail jadwal ${row.pelanggan?.nama_lengkap ?? 'pelanggan'}`}
        >
          <ChevronDown size={20} className="jadwal-chevron transition" />
        </label>
      </div>

      <div className="hidden border-t border-[#e5e7eb] bg-[#fbfcff] peer-checked:block">
        <form action={action} className="p-4 sm:p-6">
          <input type="hidden" name="status" value={row.status} />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <MapPin size={14} />
                  Alamat Pemasangan
                </p>
                <p className="mt-2 text-[14px] leading-6 text-slate-600">
                  {row.pelanggan?.alamat_pemasangan ?? '-'}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Catatan Saat Ini
                </p>
                <p className="mt-2 text-[14px] leading-6 text-slate-600">
                  {row.catatan || 'Belum ada catatan.'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminFieldLabel label="Tanggal Pemasangan">
                  <input
                    type="date"
                    name="tanggal_pemasangan"
                    defaultValue={toDateInput(row.tanggal_pemasangan)}
                    className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-slate-800 outline-none transition focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
                  />
                </AdminFieldLabel>

                <AdminFieldLabel label="Jam Pemasangan">
                  <input
                    type="time"
                    name="jam_pemasangan"
                    defaultValue={toTimeInput(row.tanggal_pemasangan)}
                    className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-slate-800 outline-none transition focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
                  />
                </AdminFieldLabel>

                <AdminFieldLabel label="Teknisi">
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      name="teknisi"
                      defaultValue={row.teknisi ?? ''}
                      placeholder="Nama teknisi"
                      className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white py-3 pl-10 pr-3 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
                    />
                  </div>
                </AdminFieldLabel>

                <AdminFieldLabel label="No. HP Teknisi">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      name="no_hp_teknisi"
                      defaultValue={row.no_hp_teknisi ?? ''}
                      placeholder="08xxxxxxxxxx"
                      className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white py-3 pl-10 pr-3 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
                    />
                  </div>
                </AdminFieldLabel>

                <AdminFieldLabel label="Catatan" className="sm:col-span-2">
                  <textarea
                    name="catatan"
                    defaultValue={row.catatan ?? ''}
                    rows={3}
                    placeholder="Contoh: teknisi akan menghubungi sebelum datang, patokan rumah, atau kendala akses."
                    className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-[14px] leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
                  />
                </AdminFieldLabel>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] leading-5 text-slate-500">
                  Detail jadwal ini akan tampil di notifikasi dashboard pelanggan.
                </p>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] active:scale-[0.98] sm:w-36"
                >
                  <Save size={15} />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </article>
  )
}

function ScheduleStatusBadge({ status }: { status: StatusJadwalInstalasi }) {
  return (
    <AdminStatusBadge
      tone={scheduleStatusTone[status]}
      icon={status === 'dibatalkan' ? <XCircle size={13} /> : undefined}
    >
      {labelScheduleStatus(status)}
    </AdminStatusBadge>
  )
}

function toDateInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function toTimeInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60_000)
  return localDate.toISOString().slice(11, 16)
}

function formatDateTime(value: string | null) {
  if (!value) return 'Belum dijadwalkan'
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
