import Link from 'next/link'
import { ArrowLeft, LockKeyhole, MapPin } from 'lucide-react'
import ConfirmActionForm from '@/components/ConfirmActionForm'
import PanelInfoTile from '@/components/panel/shared/PanelInfoTile'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import TicketMessageTimeline from '@/components/tickets/TicketMessageTimeline'
import TicketReplyForm from '@/components/tickets/TicketReplyForm'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge'
import {
  closeTicketAction,
  scheduleTicketServiceAction,
  sendAdminTicketMessageAction,
} from '@/app/admin/tiket/actions'
import type { TicketDetail } from '@/lib/data/tiket'
import TicketScheduleModal from '@/components/tickets/TicketScheduleModal'

export default function AdminTicketDetail({ ticket }: { ticket: TicketDetail }) {
  const isOpen = ticket.status === 'open'
  const replyAction = sendAdminTicketMessageAction.bind(null, ticket.id)
  const closeAction = closeTicketAction.bind(null, ticket.id)
  const scheduleAction = scheduleTicketServiceAction.bind(null, ticket.id)

  return (
    <div className="space-y-6">
      <Link
        href="/admin/tiket"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Kembali ke Tiket Layanan
      </Link>

      <PanelSectionCard
        title={ticket.subjek}
        subtitle={`${ticket.nomor_tiket} - dibuat ${new Date(ticket.created_at).toLocaleString('id-ID')}`}
        action={<TicketStatusBadge status={ticket.status} />}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PanelInfoTile
            label="Pelanggan"
            value={ticket.pelanggan?.nama_lengkap ?? 'Pelanggan tidak diketahui'}
          />
          <PanelInfoTile
            label="No. HP"
            value={ticket.pelanggan?.no_hp ?? '-'}
          />
          <PanelInfoTile
            label="Email"
            value={ticket.pelanggan?.email ?? '-'}
          />
          <PanelInfoTile
            label="Status"
            value={ticket.status === 'open' ? 'Open' : 'Closed'}
          />
        </div>

        <div className="mt-4 rounded-xl border border-[#e5e7eb] bg-[#f8faff] px-4 py-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <MapPin size={14} />
            Alamat Pemasangan
          </p>
          <p className="mt-2 text-[14px] leading-6 text-slate-600">
            {ticket.pelanggan?.alamat_pemasangan ?? '-'}
          </p>
        </div>
      </PanelSectionCard>

      <PanelSectionCard
        title="Percakapan Tiket"
        subtitle="Timeline pesan pelanggan, admin, dan sistem."
      >
        <TicketMessageTimeline messages={ticket.messages} currentViewer="admin" />
      </PanelSectionCard>

      <PanelSectionCard
        title={isOpen ? 'Tindak Lanjut Admin' : 'Tiket Ditutup'}
        subtitle={isOpen ? 'Balas pelanggan, jadwalkan layanan, atau tutup tiket.' : 'Tiket tertutup tidak dapat menerima pesan baru.'}
        action={
          isOpen ? (
            <div className="flex flex-wrap items-center gap-3">
              <TicketScheduleModal action={scheduleAction} ticketNumber={ticket.nomor_tiket} />
              <ConfirmActionForm
                action={closeAction}
                itemName={ticket.nomor_tiket}
                title="Tutup Tiket"
                message="Tiket yang sudah ditutup tidak bisa menerima pesan baru."
                confirmLabel="Tutup Tiket"
                destructive={false}
              >
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-[14px] font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LockKeyhole size={16} />
                  Tutup Tiket
                </button>
              </ConfirmActionForm>
            </div>
          ) : null
        }
      >
        <TicketReplyForm
          action={replyAction}
          disabled={!isOpen}
          placeholder="Tulis balasan untuk pelanggan..."
        />
      </PanelSectionCard>
    </div>
  )
}
