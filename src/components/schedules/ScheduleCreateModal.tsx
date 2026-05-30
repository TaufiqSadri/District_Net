'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, X } from 'lucide-react'
import PanelToast from '@/components/panel/shared/PanelToast'
import ScheduleForm, {
  type ScheduleCustomerOption,
} from '@/components/schedules/ScheduleForm'
import type { ScheduleActionResult } from '@/components/schedules/scheduleActionTypes'

interface ScheduleCreateModalProps {
  action: (formData: FormData) => Promise<ScheduleActionResult>
  customers: ScheduleCustomerOption[]
}

export default function ScheduleCreateModal({
  action,
  customers,
}: ScheduleCreateModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [toast, setToast] = useState<ScheduleActionResult | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const form = event.currentTarget
    const formData = new FormData(form)
    setPending(true)
    const result = await action(formData)
    setPending(false)
    setToast(result)

    if (result.success) {
      form.reset()
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
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] active:scale-[0.98]"
      >
        <CalendarPlus size={17} />
        Jadwalkan Layanan
      </button>

      {open ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-[18px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] px-6 py-5">
              <div>
                <h2 className="text-[20px] font-semibold text-[#111827]">
                  Jadwalkan Layanan
                </h2>
                <p className="mt-1 text-[14px] text-slate-500">
                  Buat jadwal manual tanpa tiket layanan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe5ef] text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Tutup modal jadwal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <ScheduleForm
                mode="manual"
                customers={customers}
                pending={pending}
                submitLabel="Simpan Jadwal"
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
