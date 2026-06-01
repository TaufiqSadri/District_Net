'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserCheck } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface ApprovePelangganButtonProps {
  pelangganId: string
  namaLengkap: string
}

export default function ApprovePelangganButton({
  pelangganId,
  namaLengkap,
}: ApprovePelangganButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState('')

  function approve() {
    setError('')
    startTransition(async () => {
      try {
        const { approvePelanggan } = await import('@/app/admin/actions')
        await approvePelanggan(pelangganId, new FormData())
        setConfirmOpen(false)
        router.refresh()
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
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <UserCheck size={15} />}
        Approve Pelanggan
      </button>
      {error ? <p className="text-right text-xs font-medium text-red-600">{error}</p> : null}
      <ConfirmDialog
        open={confirmOpen}
        title="Approve Pelanggan"
        itemName={namaLengkap}
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
