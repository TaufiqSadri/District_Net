import type { StatusLangganan } from '@/types/database'

const badgeStyles: Record<StatusLangganan, { label: string; className: string; dotClassName: string }> = {
  aktif: {
    label: 'Aktif',
    className: 'bg-emerald-100 text-emerald-600',
    dotClassName: 'bg-emerald-500',
  },
  ditangguhkan: {
    label: 'Ditangguhkan',
    className: 'bg-slate-100 text-slate-500',
    dotClassName: 'bg-slate-400',
  },
  proses_instalasi: {
    label: 'Proses Instalasi',
    className: 'bg-amber-100 text-amber-600',
    dotClassName: 'bg-amber-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-violet-100 text-violet-600',
    dotClassName: 'bg-violet-500',
  },
  nonaktif: {
    label: 'Nonaktif',
    className: 'bg-red-100 text-red-600',
    dotClassName: 'bg-red-500',
  },
}

export default function StatusBadge({ status }: { status: StatusLangganan }) {
  const style = badgeStyles[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase ${style.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dotClassName}`} />
      {style.label}
    </span>
  )
}
