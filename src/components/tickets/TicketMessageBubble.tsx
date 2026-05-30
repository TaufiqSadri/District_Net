import { Info } from 'lucide-react'
import type { TicketSenderType } from '@/lib/data/tiket'

export type TicketViewer = 'admin' | 'pelanggan'

interface TicketMessageBubbleProps {
  senderType: TicketSenderType
  currentViewer: TicketViewer
  content: string
  timestamp: string
}

const senderLabel: Record<TicketSenderType, string> = {
  pelanggan: 'Pelanggan',
  admin: 'Admin',
  system: 'Sistem',
}

export default function TicketMessageBubble({
  senderType,
  currentViewer,
  content,
  timestamp,
}: TicketMessageBubbleProps) {
  if (senderType === 'system') {
    return (
      <div className="flex justify-center">
        <article className="max-w-2xl rounded-[18px] border border-blue-100 bg-blue-50 px-4 py-3 text-center text-[14px] leading-6 text-blue-800">
          <div className="mb-1 flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-blue-600">
            <Info size={14} />
            Sistem
          </div>
          <p className="whitespace-pre-line">{content}</p>
          <time className="mt-2 block text-[12px] font-medium text-blue-500">
            {formatTimestamp(timestamp)}
          </time>
        </article>
      </div>
    )
  }

  const isOwn =
    (currentViewer === 'admin' && senderType === 'admin') ||
    (currentViewer === 'pelanggan' && senderType === 'pelanggan')
  const alignment = isOwn ? 'justify-end' : 'justify-start'
  const bubbleClass = isOwn
    ? 'border-[#6741f5] bg-[#6741f5] text-white shadow-[0_10px_22px_rgba(103,65,245,0.16)]'
    : 'border-[#e5e7eb] bg-[#f8faff] text-slate-700'
  const metaClass = isOwn ? 'text-white/75' : 'text-slate-500'

  return (
    <div className={`flex ${alignment}`}>
      <article className={`max-w-[min(34rem,88%)] rounded-[18px] border px-4 py-3 ${bubbleClass}`}>
        <div className={`mb-1 flex flex-wrap items-center gap-2 text-[12px] font-semibold ${metaClass}`}>
          <span>{senderLabel[senderType]}</span>
          <span aria-hidden="true">-</span>
          <time>{formatTimestamp(timestamp)}</time>
        </div>
        <p className="whitespace-pre-line text-[14px] leading-6">{content}</p>
      </article>
    </div>
  )
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('id-ID')
}
