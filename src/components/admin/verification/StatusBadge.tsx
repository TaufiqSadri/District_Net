const statusConfig: Record<string, { label: string; className: string; dotClassName: string }> = {
  diterima: {
    label: 'Lunas',
    className: 'bg-emerald-50 text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
  lunas: {
    label: 'Lunas',
    className: 'bg-emerald-50 text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
  menunggu: {
    label: 'Menunggu',
    className: 'bg-lime-50 text-lime-700',
    dotClassName: 'bg-lime-500',
  },
  ditolak: {
    label: 'Ditolak',
    className: 'bg-red-50 text-red-700',
    dotClassName: 'bg-red-500',
  },
  belum_bayar: {
    label: 'Belum Dibayar',
    className: 'bg-red-50 text-red-700',
    dotClassName: 'bg-red-500',
  },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-600',
    dotClassName: 'bg-slate-400',
  }

  return (
    <span
      className={`inline-flex min-w-[106px] items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase leading-none ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`} />
      {config.label}
    </span>
  )
}
