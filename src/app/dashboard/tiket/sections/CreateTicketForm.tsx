import { PlusCircle } from 'lucide-react'
import { createTicketAction } from '@/app/dashboard/tiket/actions'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'

export default function CreateTicketForm() {
  return (
    <PanelSectionCard
      title="Buat Tiket Baru"
      subtitle="Jelaskan kendala layanan agar tim District Net dapat menindaklanjuti."
    >
      <form id="buat-tiket" action={createTicketAction} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-slate-700">
            Subjek
          </label>
          <input
            name="subjek"
            required
            minLength={3}
            placeholder="Contoh: Internet putus sejak pagi"
            className="h-12 w-full rounded-xl border-0 bg-[#f1f4fc] px-4 text-[15px] font-normal text-slate-800 outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-[#6741f5]/25"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-slate-700">
            Pesan Awal
          </label>
          <textarea
            name="pesan_awal"
            rows={6}
            required
            minLength={10}
            placeholder="Ceritakan kendala, waktu kejadian, dan kondisi perangkat di rumah."
            className="w-full resize-none rounded-xl border-0 bg-[#f1f4fc] px-4 py-3 text-[15px] font-normal leading-6 text-slate-800 outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-[#6741f5]/25"
          />
        </div>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] active:scale-[0.98]"
        >
          <PlusCircle size={17} />
          Buat Tiket Baru
        </button>
      </form>
    </PanelSectionCard>
  )
}
