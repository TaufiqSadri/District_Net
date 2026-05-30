import TicketMessageBubble, {
  type TicketViewer,
} from '@/components/tickets/TicketMessageBubble'
import type { TicketMessage } from '@/lib/data/tiket'

interface TicketMessageTimelineProps {
  messages: TicketMessage[]
  currentViewer: TicketViewer
}

export default function TicketMessageTimeline({
  messages,
  currentViewer,
}: TicketMessageTimelineProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#dfe5ef] px-4 py-10 text-center text-[14px] text-slate-400">
        Belum ada pesan di tiket ini.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <TicketMessageBubble
          key={message.id}
          senderType={message.sender_type}
          currentViewer={currentViewer}
          content={message.pesan}
          timestamp={message.created_at}
        />
      ))}
    </div>
  )
}
