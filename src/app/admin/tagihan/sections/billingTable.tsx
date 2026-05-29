'use client'

import { useState } from 'react'
import type {
  TagihanInstalasiWithRelations,
  TagihanStatus,
  TagihanWithRelations,
} from '@/lib/data/tagihan'
import BillingTableRow, {
  BillingMobileRow,
  type BillingRow,
  type BillingVariant,
} from '@/app/admin/tagihan/sections/BillingTableRow'
import PanelPagination from '@/components/panel/shared/PanelPagination'

interface BillingTableProps {
  variant?: BillingVariant
  rows: TagihanWithRelations[] | TagihanInstalasiWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const columns = ['Pelanggan', 'Periode', 'Nominal', 'Jatuh Tempo', 'Status', 'Bukti', 'Aksi']

export default function BillingTable({
  variant = 'bulanan',
  rows,
  total,
  page,
  totalPages,
}: BillingTableProps) {
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  function handleMarkPaid(id: string) {
    setPaidIds((prev) => new Set([...Array.from(prev), id]))
  }

  function handleDelete(id: string) {
    setDeletedIds((prev) => new Set([...Array.from(prev), id]))
  }

  const visibleRows = (rows as BillingRow[]).filter((row) => !deletedIds.has(row.id))

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1060px] text-left">
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
              visibleRows.map((row) => {
                const status: TagihanStatus = paidIds.has(row.id) ? 'lunas' : row.status_tagihan

                return (
                  <BillingTableRow
                    key={row.id}
                    row={row}
                    variant={variant}
                    status={status}
                    onMarkPaid={handleMarkPaid}
                    onDelete={handleDelete}
                  />
                )
              })
            ) : (
              <tr className="border-t border-[#e5e7eb]">
                <td colSpan={columns.length} className="px-8 py-12 text-center text-sm text-slate-400">
                  Tidak ada tagihan yang cocok dengan filter saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden">
        {visibleRows.length > 0 ? (
          visibleRows.map((row) => {
            const status: TagihanStatus = paidIds.has(row.id) ? 'lunas' : row.status_tagihan

            return (
              <BillingMobileRow
                key={row.id}
                row={row}
                variant={variant}
                status={status}
                onMarkPaid={handleMarkPaid}
                onDelete={handleDelete}
              />
            )
          })
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            Tidak ada tagihan yang cocok dengan filter saat ini.
          </div>
        )}
      </div>

      <PanelPagination
        itemLabel="Tagihan"
        currentCount={visibleRows.length}
        filteredTotal={total}
        page={page}
        totalPages={totalPages}
      />
    </section>
  )
}
