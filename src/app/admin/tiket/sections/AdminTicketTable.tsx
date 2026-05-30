import Link from 'next/link'
import { Eye } from 'lucide-react'
import PanelPagination from '@/components/panel/shared/PanelPagination'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge'
import type { TicketListResult } from '@/lib/data/tiket'

const columns = ['Tiket #', 'Tanggal Dibuat', 'Status', 'Pelanggan', 'Subjek', 'Aksi']

export default function AdminTicketTable({ result }: { result: TicketListResult }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-[#111827]">Daftar Tiket</h2>
            <p className="mt-1 text-[14px] font-normal text-slate-500">
              Pantau percakapan layanan dan tindak lanjut dari pelanggan.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-slate-50 px-3 py-1.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-100">
            {result.total} tiket
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
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
            {result.data.length === 0 ? (
              <tr className="border-t border-[#e5e7eb]">
                <td colSpan={columns.length} className="px-8 py-12 text-center text-sm text-slate-400">
                  Belum ada tiket yang cocok dengan filter saat ini.
                </td>
              </tr>
            ) : (
              result.data.map((ticket) => (
                <tr key={ticket.id} className="border-t border-[#eef2f7]">
                  <td className="px-8 py-4">
                    <p className="font-semibold text-[#111827]">{ticket.nomor_tiket}</p>
                    <p className="mt-1 text-[12px] text-slate-400">{ticket.messageCount} pesan</p>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-slate-600">
                    {new Date(ticket.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <TicketStatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#111827]">
                      {ticket.pelanggan?.nama_lengkap ?? 'Pelanggan tidak diketahui'}
                    </p>
                    <p className="mt-1 text-[13px] text-slate-500">{ticket.pelanggan?.no_hp ?? '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="line-clamp-1 font-medium text-slate-800">{ticket.subjek}</p>
                    <p className="mt-1 line-clamp-1 text-[13px] text-slate-500">
                      {ticket.latestMessage?.pesan ?? 'Belum ada pesan.'}
                    </p>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Link
                      href={`/admin/tiket/${ticket.id}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dfe5ef] px-4 text-[13px] font-semibold text-slate-700 transition hover:border-[#6741f5]/40 hover:text-[#6741f5]"
                    >
                      <Eye size={15} />
                      Lihat Tiket
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PanelPagination
        basePath="/admin/tiket"
        itemLabel="Tiket"
        currentCount={result.data.length}
        filteredTotal={result.total}
        page={result.page}
        totalPages={result.totalPages}
      />
    </section>
  )
}
