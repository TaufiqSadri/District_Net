import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PanelInfoTile from '@/components/panel/shared/PanelInfoTile'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import TicketMessageTimeline from '@/components/tickets/TicketMessageTimeline'
import TicketReplyForm from '@/components/tickets/TicketReplyForm'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge'
import { sendCustomerTicketMessageAction } from '@/app/dashboard/tiket/actions'
import type { TicketDetail } from '@/lib/data/tiket'

export default function CustomerTicketDetail({ ticket }: { ticket: TicketDetail }) {
  const isOpen = ticket.status === 'open'
  const replyAction = sendCustomerTicketMessageAction.bind(null, ticket.id)

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/tiket"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Kembali ke Tiket Saya
      </Link>

      <PanelSectionCard
        title={ticket.subjek}
        subtitle={`${ticket.nomor_tiket} - dibuat ${new Date(ticket.created_at).toLocaleString('id-ID')}`}
        action={<TicketStatusBadge status={ticket.status} />}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <PanelInfoTile label="Nomor Tiket" value={ticket.nomor_tiket} />
          <PanelInfoTile label="Status" value={ticket.status === 'open' ? 'Open' : 'Closed'} />
          <PanelInfoTile
            label="Tanggal Dibuat"
            value={new Date(ticket.created_at).toLocaleDateString('id-ID')}
          />
        </div>
      </PanelSectionCard>

      <PanelSectionCard
        title="Percakapan"
        subtitle="Pesan Anda dan tindak lanjut dari admin."
      >
        <TicketMessageTimeline messages={ticket.messages} currentViewer="pelanggan" />
      </PanelSectionCard>

      <PanelSectionCard
        title={isOpen ? 'Kirim Pesan' : 'Tiket Ditutup'}
        subtitle={isOpen ? 'Tambahkan informasi baru selama tiket masih open.' : 'Buat tiket baru jika kendala masih berlanjut.'}
      >
        <TicketReplyForm
          action={replyAction}
          disabled={!isOpen}
          buttonLabel="Kirim Pesan"
          placeholder="Tambahkan informasi kendala..."
          showCustomerClosedCta
        />
      </PanelSectionCard>
    </div>
  )
}
