import { Send } from 'lucide-react'
import { createKomplain } from '@/app/dashboard/actions'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'

export default function ComplaintFormSection() {
  return (
    <PanelSectionCard
      title="Kirim Komplain Baru"
      subtitle="Jelaskan kendala layanan agar admin bisa menindaklanjuti lebih cepat."
    >
      <form action={createKomplain} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-slate-700">
            Isi Komplain
          </label>
          <textarea
            name="isi_komplain"
            rows={8}
            required
            minLength={10}
            placeholder="Contoh: Internet sering putus sejak tadi pagi dan lampu LOS berkedip merah."
            className="w-full rounded-xl border-0 bg-[#f1f4fc] px-4 py-3 text-[15px] font-normal text-slate-800 outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-[#6741f5]/25"
          />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-6 text-amber-800">
          Jelaskan kendala sejelas mungkin agar admin lebih cepat membantu.
        </div>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] active:scale-[0.98]"
        >
          <Send size={17} />
          Kirim Komplain
        </button>
      </form>
    </PanelSectionCard>
  )
}
