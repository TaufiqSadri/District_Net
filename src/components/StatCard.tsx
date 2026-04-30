import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  iconBg: string
  valueColor?: string
}

export default function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  valueColor,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`font-display text-2xl font-bold ${valueColor ?? 'text-gray-900'}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-gray-400">{sub}</p> : null}
    </div>
  )
}
