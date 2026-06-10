'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, Loader2, UserCheck } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface RegistrationActionsProps {
  id: string
  name: string
  status: string
}

export default function RegistrationActions({
  id,
  name,
  status,
}: RegistrationActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState('')
  const canApprove = status === 'pending' && !approved

  function approve() {
    setError('')
    startTransition(async () => {
      try {
        const { approvePelanggan } = await import('@/app/admin/actions')
        await approvePelanggan(id, new FormData())
        setApproved(true)
        setConfirmOpen(false)
      } catch (approveError) {
        setConfirmOpen(false)
        setError(
          approveError instanceof Error
            ? approveError.message
            : 'Gagal approve pelanggan.',
        )
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center justify-end gap-2">
        {canApprove ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isPending}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
            Approve
          </button>
        ) : null}
        <Link
          href={`/admin/pelanggan/${id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
          aria-label={`Buka detail ${name}`}
        >
          <Eye size={17} />
        </Link>
      </div>
      {error ? <p className="max-w-44 text-right text-xs font-medium text-red-600">{error}</p> : null}
      <ConfirmDialog
        open={confirmOpen}
        title="Approve Pelanggan"
        itemName={name}
        message="Pelanggan ini akan disetujui, tagihan instalasi akan dibuat, dan pelanggan bisa lanjut ke pembayaran instalasi."
        confirmLabel="Ya, Approve"
        destructive={false}
        pending={isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={approve}
      />
    </div>
  )
}
