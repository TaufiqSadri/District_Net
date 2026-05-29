import type { ReactNode } from 'react'

export type PanelTone = 'violet' | 'emerald' | 'amber' | 'red' | 'blue' | 'orange' | 'slate'

const toneClasses: Record<PanelTone, string> = {
  violet: 'bg-[#eee8ff] text-[#6741f5]',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-orange-50 text-orange-600',
  slate: 'bg-slate-50 text-slate-600',
}

interface PanelMetricCardProps {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  tone?: PanelTone
}

export default function PanelMetricCard({
  label,
  value,
  sub,
  icon,
  tone = 'violet',
}: PanelMetricCardProps) {
  return (
    <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-3 break-words text-[30px] font-semibold leading-none text-[#111827]">
            {value}
          </p>
          {sub ? (
            <p className="mt-2 text-[13px] font-normal text-slate-500">{sub}</p>
          ) : null}
        </div>
        <div className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl ${toneClasses[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
