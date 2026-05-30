'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import PanelToast from '@/components/panel/shared/PanelToast'
import ScheduleForm from '@/components/schedules/ScheduleForm'
import type { ScheduleActionResult } from '@/components/schedules/scheduleActionTypes'
import type { JadwalInstalasiWithRelations } from '@/lib/data/jadwalInstalasi'

interface ScheduleEditModalProps {
  row: JadwalInstalasiWithRelations
  action: (formData: FormData) => Promise<ScheduleActionResult>
}

export default function ScheduleEditModal({
  row,
  action,
}: ScheduleEditModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [toast, setToast] = useState<ScheduleActionResult | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const formData = new FormData(event.currentTarget)
    setPending(true)
    const result = await action(formData)
    setPending(false)
    setToast(result)

    if (result.success) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <PanelToast
        message={toast?.message ?? null}
        tone={toast?.success === false ? 'error' : 'success'}
      />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dfe5ef] px-4 text-[13px] font-semibold text-slate-700 transition hover:border-[#6741f5]/40 hover:text-[#6741f5]"
      >
        <Pencil size={14} />
        Edit
      </button>

      {open ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-[18px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] px-6 py-5">
              <div>
                <h2 className="text-[20px] font-semibold text-[#111827]">
                  Edit Jadwal Layanan
                </h2>
                <p className="mt-1 text-[14px] text-slate-500">
                  {row.pelanggan?.nama_lengkap ?? 'Pelanggan tidak diketahui'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe5ef] text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Tutup modal edit jadwal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <ScheduleForm
                mode="edit"
                values={row}
                pending={pending}
                submitLabel="Simpan"
                onSubmit={handleSubmit}
                onCancel={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
