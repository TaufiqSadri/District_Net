'use client'

import { useState } from 'react'
import type { PelangganWithPaket, StatusLangganan } from '@/types/database'
import AdminPagination from '@/components/admin/shared/AdminPagination'
import CustomerTableRow, { CustomerMobileRow } from '@/components/admin/customers/CustomerTableRow'

interface CustomerTableProps {
  rows: PelangganWithPaket[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const columns = ['Pelanggan', 'Kontak', 'Paket', 'Status', 'Bergabung', 'Aksi']

export default function CustomerTable({
  rows,
  total,
  page,
  totalPages,
}: CustomerTableProps) {
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, StatusLangganan>>({})
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  function handleStatusChange(id: string, newStatus: StatusLangganan) {
    setOptimisticStatuses((prev) => ({ ...prev, [id]: newStatus }))
  }

  function handleDelete(id: string) {
    setDeletedIds((prev) => new Set([...Array.from(prev), id]))
  }

  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const formatJoinDate = (value: string | null) => {
    if (!value) return 'Belum aktif'
    return formatter.format(new Date(value))
  }

  const visibleRows = rows.filter((row) => !deletedIds.has(row.id))

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="bg-[#f7f9fe]">
              {columns.map((column) => (
                <th
                  key={column}
                  className={`px-6 py-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-600 first:px-8 last:px-8 ${
                    column === 'Aksi' ? 'text-right' : ''
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((pelanggan) => {
                const status = optimisticStatuses[pelanggan.id] ?? pelanggan.status_langganan

                return (
                  <CustomerTableRow
                    key={pelanggan.id}
                    pelanggan={pelanggan}
                    status={status}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    formatJoinDate={formatJoinDate}
                  />
                )
              })
            ) : (
              <tr className="border-t border-[#e5e7eb]">
                <td colSpan={6} className="px-8 py-12 text-center text-sm text-slate-400">
                  Tidak ada pelanggan yang cocok dengan filter saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden">
        {visibleRows.length > 0 ? (
          visibleRows.map((pelanggan) => {
            const status = optimisticStatuses[pelanggan.id] ?? pelanggan.status_langganan

            return (
              <CustomerMobileRow
                key={pelanggan.id}
                pelanggan={pelanggan}
                status={status}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                formatJoinDate={formatJoinDate}
              />
            )
          })
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            Tidak ada pelanggan yang cocok dengan filter saat ini.
          </div>
        )}
      </div>

      <AdminPagination
        itemLabel="Pelanggan"
        currentCount={visibleRows.length}
        filteredTotal={total}
        page={page}
        totalPages={totalPages}
      />
    </section>
  )
}
