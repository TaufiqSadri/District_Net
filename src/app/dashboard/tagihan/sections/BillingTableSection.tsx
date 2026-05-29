import Link from 'next/link'
import type { ReactNode } from 'react'
import { Wrench } from 'lucide-react'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { getPanelTagihanTone } from '@/components/panel/shared/panelStatus'
import {
  formatPeriode,
  formatRupiah,
  getStatusTagihanMeta,
} from '@/lib/data/dashboardPelanggan'
import type { TagihanInstalasi, TagihanRow } from '@/types/database'

export type UnifiedTagihan =
  | { type: 'bulanan'; data: TagihanRow }
  | { type: 'instalasi'; data: TagihanInstalasi }

interface BillingTableSectionProps {
  rows: UnifiedTagihan[]
}

export default function BillingTableSection({ rows }: BillingTableSectionProps) {
  return (
    <PanelSectionCard
      title="Daftar Tagihan"
      subtitle="Klik detail untuk mengirim bukti pembayaran pada tagihan yang belum dibayar."
      bodyClassName="p-0"
    >
      {rows.length === 0 ? (
        <div className="px-6 py-12 text-center text-[14px] text-slate-400">
          Belum ada tagihan untuk akun Anda.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f7f9fe] text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4">Periode</th>
                <th className="px-6 py-4">Jatuh Tempo</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) =>
                item.type === 'instalasi' ? (
                  <InstallationRow key={`instalasi-${item.data.id}`} data={item.data} />
                ) : (
                  <MonthlyRow key={`bulanan-${item.data.id}`} data={item.data} />
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </PanelSectionCard>
  )
}

function InstallationRow({ data }: { data: TagihanInstalasi }) {
  const badge = getStatusTagihanMeta(data.status_tagihan)

  return (
    <tr className="border-b border-[#eef2f7] last:border-0">
      <td className="px-6 py-4">
        <PanelStatusBadge tone="orange" icon={<Wrench size={11} />}>
          Biaya Instalasi
        </PanelStatusBadge>
      </td>
      <td className="px-6 py-4 text-slate-500">
        {data.jatuh_tempo ? new Date(data.jatuh_tempo).toLocaleDateString('id-ID') : '-'}
      </td>
      <td className="px-6 py-4 font-medium text-slate-700">
        {formatRupiah(data.jumlah_tagihan)}
      </td>
      <td className="px-6 py-4">
        <PanelStatusBadge tone={getPanelTagihanTone(data.status_tagihan)}>
          {badge.label}
        </PanelStatusBadge>
      </td>
      <td className="px-6 py-4 text-right">
        <BillActionLink
          href={`/dashboard/tagihan-instalasi/${data.id}`}
          urgent={data.status_tagihan === 'belum_bayar'}
        >
          {data.status_tagihan === 'belum_bayar' ? 'Bayar Sekarang' : 'Lihat Detail'}
        </BillActionLink>
      </td>
    </tr>
  )
}

function MonthlyRow({ data }: { data: TagihanRow }) {
  const badge = getStatusTagihanMeta(data.status_tagihan)

  return (
    <tr className="border-b border-[#eef2f7] last:border-0">
      <td className="px-6 py-4 font-medium text-slate-700">
        {formatPeriode(data.bulan, data.tahun)}
      </td>
      <td className="px-6 py-4 text-slate-500">
        {data.jatuh_tempo ? new Date(data.jatuh_tempo).toLocaleDateString('id-ID') : '-'}
      </td>
      <td className="px-6 py-4 font-medium text-slate-700">
        {formatRupiah(data.jumlah_tagihan)}
      </td>
      <td className="px-6 py-4">
        <PanelStatusBadge tone={getPanelTagihanTone(data.status_tagihan)}>
          {badge.label}
        </PanelStatusBadge>
      </td>
      <td className="px-6 py-4 text-right">
        <BillActionLink
          href={`/dashboard/tagihan/${data.id}`}
          urgent={data.status_tagihan === 'belum_bayar'}
        >
          {data.status_tagihan === 'belum_bayar' ? 'Bayar Sekarang' : 'Lihat Detail'}
        </BillActionLink>
      </td>
    </tr>
  )
}

function BillActionLink({
  href,
  urgent,
  children,
}: {
  href: string
  urgent: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={
        urgent
          ? 'inline-flex h-9 items-center justify-center rounded-xl bg-[#6741f5] px-3 text-xs font-semibold text-white transition hover:bg-[#5b2fd6]'
          : 'inline-flex h-9 items-center justify-center rounded-xl border border-[#dfe5ef] px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50'
      }
    >
      {children}
    </Link>
  )
}
