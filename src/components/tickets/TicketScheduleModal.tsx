'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, X } from 'lucide-react'
import PanelToast from '@/components/panel/shared/PanelToast'
import ScheduleForm from '@/components/schedules/ScheduleForm'
import type { ScheduleActionResult } from '@/components/schedules/scheduleActionTypes'

interface TicketScheduleModalProps {
  action: (formData: FormData) => Promise<ScheduleActionResult>
  ticketNumber: string
}

export default function TicketScheduleModal({
  action,
  ticketNumber,
}: TicketScheduleModalProps) {
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
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d7ceff] bg-white px-4 text-[14px] font-semibold text-[#6741f5] transition hover:bg-[#f8f6ff]"
      >
        <CalendarPlus size={16} />
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
                <p className="mt-1 text-[14px] text-slate-500">{ticketNumber}</p>
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
                mode="ticket"
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
