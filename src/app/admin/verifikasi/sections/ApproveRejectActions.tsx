'use client'

import { useState, useTransition } from 'react'
import { Check, X } from 'lucide-react'
import type { PembayaranWithRelations } from '@/lib/data/pembayaran'
import { getPembayaranPelanggan } from '@/lib/pembayaranPelanggan'
import ConfirmDialog from '@/components/ConfirmDialog'

interface ApproveRejectActionsProps {
  pembayaran: PembayaranWithRelations
  status: string
  onApprove: (id: string, pdfUrl: string | null) => void
  onReject: (id: string) => void
}

type ConfirmState = {
  title: string
  message: string
  confirmLabel: string
  destructive: boolean
  action: 'approve' | 'reject'
}

export default function ApproveRejectActions({
  pembayaran,
  status,
  onApprove,
  onReject,
}: ApproveRejectActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmAction, setConfirmAction] = useState<ConfirmState | null>(null)
  const [error, setError] = useState('')
  const canAct = status === 'menunggu'
  const pelangganName = getPembayaranPelanggan(pembayaran)?.nama_lengkap ?? 'pelanggan'

  if (!canAct) {
    return <span className="inline-flex w-[62px] justify-center text-[15px] font-medium text-slate-400">—</span>
  }

  function approvePayment() {
    startTransition(async () => {
      setError('')

      try {
        const { approvePayment } = await import('@/lib/data/pembayaran')
        await approvePayment(pembayaran.id)

        let pdfUrl: string | null = null
        try {
          const response = await fetch('/api/invoice/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pembayaran_id: pembayaran.id }),
          })
          const data = await response.json().catch(() => null) as {
            invoice?: { pdf_url?: string | null }
            error?: string
          } | null

          if (!response.ok || data?.error) {
            throw new Error(data?.error ?? 'Gagal membuat invoice otomatis.')
          }

          pdfUrl = data?.invoice?.pdf_url ?? null
        } catch (invoiceError) {
          setError(
            invoiceError instanceof Error
              ? invoiceError.message
              : 'Gagal membuat invoice otomatis.',
          )
        }

        onApprove(pembayaran.id, pdfUrl)
        setConfirmAction(null)
      } catch (approveError) {
        setError(
          approveError instanceof Error
            ? approveError.message
            : 'Gagal menyetujui pembayaran.',
        )
      }
    })
  }

  function rejectPayment() {
    startTransition(async () => {
      setError('')

      try {
        const { rejectPayment } = await import('@/lib/data/pembayaran')
        await rejectPayment(pembayaran.id)
        onReject(pembayaran.id)
        setConfirmAction(null)
      } catch (rejectError) {
        setError(
          rejectError instanceof Error
            ? rejectError.message
            : 'Gagal menolak pembayaran.',
        )
      }
    })
  }

  return (
    <>
      <div className="flex w-[62px] flex-col gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (!canAct) return
            setConfirmAction({
              title: 'Konfirmasi Setuju Pembayaran',
              message: 'Pembayaran ini akan disetujui, tagihan terkait ditandai lunas, dan invoice dibuat otomatis.',
              confirmLabel: 'Ya, Setuju',
              destructive: false,
              action: 'approve',
            })
          }}
          disabled={!canAct || isPending}
          className="inline-flex h-6 items-center justify-center gap-1 rounded-md bg-emerald-100 px-2 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check size={11} />
          Setuju
        </button>
        <button
          type="button"
          onClick={() => {
            if (!canAct) return
            setConfirmAction({
              title: 'Konfirmasi Tolak Pembayaran',
              message: 'Pembayaran ini akan ditolak dan tagihan kembali berstatus belum bayar.',
              confirmLabel: 'Ya, Tolak',
              destructive: true,
              action: 'reject',
            })
          }}
          disabled={!canAct || isPending}
          className="inline-flex h-6 items-center justify-center gap-1 rounded-md bg-red-100 px-2 text-[11px] font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={11} />
          Tolak
        </button>
      </div>

      {error ? (
        <p className="mt-1 max-w-[120px] text-[10px] font-medium leading-tight text-red-600">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.title}
        itemName={pelangganName}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        destructive={confirmAction?.destructive}
        pending={isPending}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.action === 'approve') {
            approvePayment()
          } else if (confirmAction?.action === 'reject') {
            rejectPayment()
          }
        }}
      />
    </>
  )
}
