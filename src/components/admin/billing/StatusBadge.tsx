import type { TagihanStatus } from '@/lib/data/tagihan'

const statusConfig: Record<
  TagihanStatus,
  { label: string; className: string; dotClassName: string }
> = {
  belum_bayar: {
    label: 'Belum Dibayar',
    className: 'bg-red-50 text-red-700',
    dotClassName: 'bg-red-600',
  },
  menunggu_verifikasi: {
    label: 'Menunggu Verifikasi',
    className: 'bg-amber-50 text-amber-700',
    dotClassName: 'bg-amber-500',
  },
  lunas: {
    label: 'Lunas',
    className: 'bg-emerald-50 text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-rose-50 text-rose-700',
    dotClassName: 'bg-rose-600',
  },
}

export default function StatusBadge({ status }: { status: TagihanStatus }) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex min-w-[112px] items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase leading-none ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`} />
      {config.label}
    </span>
  )
}
