'use client'

import { deletePelangganByAdmin } from '@/app/admin/actions'
import { Loader2, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

type Props = {
  pelangganId: string
  userId: string
  namaLengkap: string
}

export default function DeletePelangganButton({ pelangganId, userId, namaLengkap }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await deletePelangganByAdmin(pelangganId, userId)
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Yakin hapus <strong>{namaLengkap}</strong>?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          Ya, Hapus
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Batal
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
    >
      <Trash2 size={14} />
      Hapus
    </button>
  )
}