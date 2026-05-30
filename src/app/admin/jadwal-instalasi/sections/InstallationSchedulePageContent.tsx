import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Hammer,
  SlidersHorizontal,
  Wrench,
  XCircle,
} from 'lucide-react'
import {
  createManualJadwalLayananAction,
  updateJadwalInstalasiAction,
} from '@/app/admin/actions'
import PanelFilterSelect from '@/components/panel/shared/PanelFilterSelect'
import PanelMetricCard from '@/components/panel/shared/PanelMetricCard'
import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import ScheduleCreateModal from '@/components/schedules/ScheduleCreateModal'
import ScheduleEditModal from '@/components/schedules/ScheduleEditModal'
import type { JadwalInstalasiWithRelations, ScheduleCustomerOption } from '@/lib/data/jadwalInstalasi'
import type { JenisJadwalLayanan, StatusJadwalInstalasi } from '@/types/database'
import {
  labelScheduleStatus,
  labelScheduleType,
  scheduleStatusOptions,
  scheduleStatusTone,
  scheduleTypeOptions,
} from '@/app/admin/jadwal-instalasi/sections/scheduleConfig'

interface InstallationSchedulePageContentProps {
  rows: JadwalInstalasiWithRelations[]
  customers: ScheduleCustomerOption[]
  status: StatusJadwalInstalasi | 'semua'
  jenis: JenisJadwalLayanan | 'semua'
}

const columns = ['Jenis', 'Pelanggan', 'Tanggal', 'Teknisi', 'Status', 'Sumber', 'Aksi']

export default function InstallationSchedulePageContent({
  rows,
  customers,
  status,
  jenis,
}: InstallationSchedulePageContentProps) {
  const menunggu = rows.filter((row) => row.status === 'menunggu_jadwal').length
  const terjadwal = rows.filter((row) => row.status === 'terjadwal').length
  const dikerjakan = rows.filter((row) => row.status === 'dikerjakan').length
  const selesai = rows.filter((row) => row.status === 'selesai').length

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Jadwal Layanan"
        subtitle="Kelola jadwal instalasi, pengecekan, dan perbaikan pelanggan."
        action={
            <ScheduleCreateModal
              action={createManualJadwalLayananAction}
              customers={customers} 
            />
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PanelMetricCard
          label="Menunggu Jadwal"
          value={menunggu}
          sub="Perlu diatur"
          icon={<Clock size={18} />}
          tone="amber"
        />
        <PanelMetricCard
          label="Terjadwal"
          value={terjadwal}
          sub="Sudah punya tanggal"
          icon={<CalendarClock size={18} />}
          tone="blue"
        />
        <PanelMetricCard
          label="Dikerjakan"
          value={dikerjakan}
          sub="Dalam proses"
          icon={<Hammer size={18} />}
          tone="violet"
        />
        <PanelMetricCard
          label="Selesai"
          value={selesai}
          sub="Pekerjaan selesai"
          icon={<CheckCircle2 size={18} />}
          tone="emerald"
        />
      </div>

      <ScheduleFilter status={status} jenis={jenis} />

      <section className="rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <div className="border-b border-[#e5e7eb] bg-white px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-[#111827]">Daftar Jadwal</h2>
              <p className="mt-1 text-[14px] font-normal text-slate-500">
                Jadwal dari instalasi dan tiket layanan tampil dalam satu daftar.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-100">
              <Wrench size={15} className="text-[#6741f5]" />
              {rows.length} jadwal
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left">
            <thead>
              <tr className="bg-[#f7f9fe]">
                {columns.map((column) => (
                  <th
                    key={column}
                    className={`px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-600 first:px-8 last:px-8 ${
                      column === 'Aksi' ? 'text-right' : ''
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="border-t border-[#e5e7eb]">
                  <td colSpan={columns.length} className="px-8 py-12 text-center text-sm text-slate-400">
                    Belum ada jadwal layanan.
                  </td>
                </tr>
              ) : (
                rows.map((row) => <ScheduleRow key={row.id} row={row} />)
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ScheduleFilter({
  status,
  jenis,
}: {
  status: StatusJadwalInstalasi | 'semua'
  jenis: JenisJadwalLayanan | 'semua'
}) {
  return (
    <form
      action="/admin/jadwal-instalasi"
      className="flex w-full flex-col gap-3 rounded-[18px] border border-[#e5e7eb] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:w-auto lg:min-w-[560px] lg:flex-row"
    >
      <PanelFilterSelect
        name="jenis"
        label="Filter jenis jadwal"
        value={jenis}
        options={scheduleTypeOptions}
        widthClass="min-w-0 flex-1"
      />
      <PanelFilterSelect
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
  const source = getScheduleSource(row)

  return (
    <tr className="border-t border-[#eef2f7] align-top">
      <td className="px-8 py-4">
        <ScheduleTypeBadge type={row.jenis_jadwal} />
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold text-[#111827]">{row.pelanggan?.nama_lengkap ?? '-'}</p>
        <p className="mt-1 text-[13px] text-slate-500">{row.pelanggan?.no_hp ?? '-'}</p>
      </td>
      <td className="px-6 py-4 text-[14px] text-slate-600">
        {formatDateTime(row.tanggal_jadwal)}
      </td>
      <td className="px-6 py-4">
        <p className="font-medium text-slate-800">{row.teknisi ?? 'Belum ditentukan'}</p>
      </td>
      <td className="px-6 py-4">
        <ScheduleStatusBadge status={row.status} />
      </td>
      <td className="px-6 py-4">
        <p className="font-medium text-slate-800">{source.title}</p>
        <p className="mt-1 text-[13px] text-slate-500">{source.description}</p>
      </td>
      <td className="px-8 py-4 text-right">
        <ScheduleEditModal row={row} action={action} />
      </td>
    </tr>
  )
}

function ScheduleStatusBadge({ status }: { status: StatusJadwalInstalasi }) {
  return (
    <PanelStatusBadge
      tone={scheduleStatusTone[status]}
      icon={status === 'dibatalkan' ? <XCircle size={13} /> : undefined}
    >
      {labelScheduleStatus(status)}
    </PanelStatusBadge>
  )
}

function ScheduleTypeBadge({ type }: { type: JenisJadwalLayanan }) {
  const tone = type === 'instalasi' ? 'orange' : type === 'pengecekan' ? 'blue' : 'violet'

  return (
    <PanelStatusBadge tone={tone}>
      {labelScheduleType(type)}
    </PanelStatusBadge>
  )
}

function getScheduleSource(row: JadwalInstalasiWithRelations) {
  if (row.tiket_layanan?.nomor_tiket) {
    return {
      title: row.tiket_layanan.nomor_tiket,
      description: row.tiket_layanan.subjek,
    }
  }

  if (row.tagihan_instalasi?.id) {
    return {
      title: 'Tagihan Instalasi',
      description: row.tagihan_instalasi.id.slice(0, 8),
    }
  }

  return {
    title: row.jenis_jadwal === 'instalasi' ? 'Instalasi' : 'Manual',
    description: 'Sumber tidak terhubung',
  }
}

function formatDateTime(value: string | null) {
  if (!value) return 'Belum dijadwalkan'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('id-ID')
}
