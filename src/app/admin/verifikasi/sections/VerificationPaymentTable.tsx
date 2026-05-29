'use client'

import { useState } from 'react'
import type { PembayaranWithRelations } from '@/lib/data/pembayaran'
import PanelPagination from '@/components/panel/shared/PanelPagination'
import PaymentProofModal from '@/app/admin/verifikasi/sections/paymentProofModal'
import VerificationPaymentRow, {
  VerificationPaymentMobileRow,
  type InvoiceLookup,
} from '@/app/admin/verifikasi/sections/VerificationPaymentRow'

interface VerificationPaymentTableProps {
  rows: PembayaranWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  invoiceMap: Record<string, InvoiceLookup>
}

const columns = ['Rincian', 'Nominal', 'Upload', 'Status', 'Bukti', 'Invoice', 'Aksi']

export default function VerificationPaymentTable({
  rows,
  total,
  page,
  totalPages,
  invoiceMap,
}: VerificationPaymentTableProps) {
  const [proofModal, setProofModal] = useState<{ url: string | null; name: string } | null>(null)
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({})
  const [optimisticInvoices, setOptimisticInvoices] = useState<Record<string, InvoiceLookup>>(invoiceMap)

  function handleApprove(id: string, pdfUrl: string | null) {
    setOptimisticStatuses((prev) => ({ ...prev, [id]: 'diterima' }))
    setOptimisticInvoices((prev) => ({
      ...prev,
      [id]: {
        id: prev[id]?.id ?? id,
        pdf_url: pdfUrl ?? prev[id]?.pdf_url ?? null,
      },
    }))
  }

  function handleReject(id: string) {
    setOptimisticStatuses((prev) => ({ ...prev, [id]: 'ditolak' }))
  }

  return (
    <>
      {proofModal ? (
        <PaymentProofModal
          url={proofModal.url}
          pelangganName={proofModal.name}
          onClose={() => setProofModal(null)}
        />
      ) : null}

      <section className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1080px] text-left">
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
              {rows.length > 0 ? (
                rows.map((pembayaran) => {
                  const status = optimisticStatuses[pembayaran.id] ?? pembayaran.status_verifikasi

                  return (
                    <VerificationPaymentRow
                      key={pembayaran.id}
                      pembayaran={pembayaran}
                      status={status}
                      invoice={optimisticInvoices[pembayaran.id]}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onViewProof={(url, name) => setProofModal({ url, name })}
                    />
                  )
                })
              ) : (
                <tr className="border-t border-[#e5e7eb]">
                  <td colSpan={columns.length} className="px-8 py-12 text-center text-sm text-slate-400">
                    Tidak ada pembayaran yang cocok dengan filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden">
          {rows.length > 0 ? (
            rows.map((pembayaran) => {
              const status = optimisticStatuses[pembayaran.id] ?? pembayaran.status_verifikasi

              return (
                <VerificationPaymentMobileRow
                  key={pembayaran.id}
                  pembayaran={pembayaran}
                  status={status}
                  invoice={optimisticInvoices[pembayaran.id]}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewProof={(url, name) => setProofModal({ url, name })}
                />
              )
            })
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              Tidak ada pembayaran yang cocok dengan filter saat ini.
            </div>
          )}
        </div>

        <PanelPagination
          itemLabel="Pembayaran"
          currentCount={rows.length}
          filteredTotal={total}
          page={page}
          totalPages={totalPages}
        />
      </section>
    </>
  )
}
