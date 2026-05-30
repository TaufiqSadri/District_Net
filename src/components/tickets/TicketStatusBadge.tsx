import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import type { TicketStatus } from '@/lib/data/tiket'

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <PanelStatusBadge tone={status === 'open' ? 'blue' : 'slate'}>
      {status === 'open' ? 'Open' : 'Closed'}
    </PanelStatusBadge>
  )
}
