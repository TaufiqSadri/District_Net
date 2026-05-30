import { Send } from 'lucide-react'
import TicketClosedNotice from '@/components/tickets/TicketClosedNotice'

interface TicketReplyFormProps {
  action: (formData: FormData) => void | Promise<void>
  disabled?: boolean
  buttonLabel?: string
  placeholder?: string
  showCustomerClosedCta?: boolean
}

export default function TicketReplyForm({
  action,
  disabled,
  buttonLabel = 'Kirim Balasan',
  placeholder = 'Tulis pesan...',
  showCustomerClosedCta,
}: TicketReplyFormProps) {
  if (disabled) return <TicketClosedNotice showCustomerCta={showCustomerClosedCta} />

  return (
    <form action={action} className="space-y-3">
      <textarea
        name="pesan"
        rows={4}
        required
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
      />
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] active:scale-[0.98]"
      >
        <Send size={16} />
        {buttonLabel}
      </button>
    </form>
  )
}
