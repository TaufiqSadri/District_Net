import Link from 'next/link'
import PanelAlert from '@/components/panel/shared/PanelAlert'

export const ticketClosedText =
  'Tiket ini sudah ditutup. Silakan buat tiket baru jika Anda masih mengalami kendala.'

export default function TicketClosedNotice({
  showCustomerCta,
}: {
  showCustomerCta?: boolean
}) {
  return (
    <PanelAlert
      tone="info"
      action={
        showCustomerCta ? (
          <Link
            href="/dashboard/tiket#buat-tiket"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#6741f5] px-4 text-sm font-semibold text-white transition hover:bg-[#5b2fd6]"
          >
            Buat Tiket Baru
          </Link>
        ) : null
      }
    >
      {ticketClosedText}
    </PanelAlert>
  )
}
