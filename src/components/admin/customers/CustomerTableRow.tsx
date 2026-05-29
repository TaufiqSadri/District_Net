'use client'

import type { PelangganWithPaket, StatusLangganan } from '@/types/database'
import ActionMenuButton from '@/components/admin/customers/ActionMenuButton'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { customerStatusConfig } from '@/constants/admin-status-styles'

interface CustomerTableRowProps {
  pelanggan: PelangganWithPaket
  status: StatusLangganan
  onStatusChange: (id: string, newStatus: StatusLangganan) => void
  onDelete: (id: string) => void
  formatJoinDate: (value: string | null) => string
}

export function formatCustomerId(id: string) {
  return `#DN-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
}

export default function CustomerTableRow({
  pelanggan,
  status,
  onStatusChange,
  onDelete,
  formatJoinDate,
}: CustomerTableRowProps) {
  return (
    <tr className="border-t border-[#e5e7eb] transition hover:bg-slate-50/60">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <Avatar name={pelanggan.nama_lengkap} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-900">
              {pelanggan.nama_lengkap}
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {formatCustomerId(pelanggan.id)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-6">
        <p className="truncate text-[15px] font-normal text-slate-900">{pelanggan.email}</p>
        <p className="mt-0.5 text-xs font-normal text-slate-500">{pelanggan.no_hp}</p>
      </td>
      <td className="px-6 py-6">
        {pelanggan.paket_internet ? (
          <div>
            <p className="text-[15px] font-semibold text-slate-900">
              {pelanggan.paket_internet.nama_paket} {pelanggan.paket_internet.kecepatan_mbps}Mbps
            </p>
            <p className="mt-0.5 text-xs font-normal text-slate-500">Fiber Optic</p>
          </div>
        ) : (
          <span className="text-sm font-normal text-slate-400">Paket belum dipilih</span>
        )}
      </td>
      <td className="px-6 py-6">
        <CustomerStatusPill status={status} />
      </td>
      <td className="px-6 py-6 text-[15px] font-normal text-slate-800">
        {formatJoinDate(pelanggan.tanggal_bergabung)}
      </td>
      <td className="px-8 py-6 text-right">
        <ActionMenuButton
          pelanggan={{ ...pelanggan, status_langganan: status }}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}

export function CustomerMobileRow({
  pelanggan,
  status,
  onStatusChange,
  onDelete,
  formatJoinDate,
}: CustomerTableRowProps) {
  return (
    <div className="border-t border-[#e5e7eb] px-5 py-5">
      <div className="flex items-start gap-4">
        <Avatar name={pelanggan.nama_lengkap} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-slate-900">
                {pelanggan.nama_lengkap}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {formatCustomerId(pelanggan.id)}
              </p>
            </div>
            <ActionMenuButton
              pelanggan={{ ...pelanggan, status_langganan: status }}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <div>
              <p className="truncate font-normal">{pelanggan.email}</p>
              <p className="text-xs text-slate-500">{pelanggan.no_hp}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CustomerStatusPill status={status} />
              <span className="text-xs text-slate-500">
                {formatJoinDate(pelanggan.tanggal_bergabung)}
              </span>
            </div>
            {pelanggan.paket_internet ? (
              <div>
                <p className="font-semibold text-slate-900">
                  {pelanggan.paket_internet.nama_paket} {pelanggan.paket_internet.kecepatan_mbps}Mbps
                </p>
                <p className="text-xs text-slate-500">Fiber Optic</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomerStatusPill({ status }: { status: StatusLangganan }) {
  const config = customerStatusConfig[status]

  return (
    <PanelStatusBadge
      className={config.className}
      dotClassName={config.dotClassName}
      textClassName="text-xs"
      uppercase
      ring={false}
    >
      {config.label}
    </PanelStatusBadge>
  )
}

function Avatar({ name }: { name: string }) {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'DN'

  const colors = [
    'bg-violet-100 text-violet-600',
    'bg-blue-100 text-blue-600',
    'bg-pink-100 text-pink-600',
    'bg-emerald-100 text-emerald-600',
  ]
  const index = (name.charCodeAt(0) || 0) % colors.length

  return (
    <div
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colors[index]}`}
    >
      {initials}
    </div>
  )
}
