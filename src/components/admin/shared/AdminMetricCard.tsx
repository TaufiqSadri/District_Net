import type { ReactNode } from 'react'

export type AdminTone = 'violet' | 'emerald' | 'amber' | 'red' | 'blue' | 'orange' | 'slate'

const toneClasses: Record<AdminTone, string> = {
  violet: 'bg-[#eee8ff] text-[#6741f5]',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-orange-50 text-orange-600',
  slate: 'bg-slate-50 text-slate-600',
}

interface AdminMetricCardProps {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  tone?: AdminTone
}

export default function AdminMetricCard({
  label,
  value,
  sub,
  icon,
  tone = 'violet',
}: AdminMetricCardProps) {
  return (
    <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-[30px] font-semibold leading-none text-[#111827]">
            {value}
          </p>
          {sub ? (
            <p className="mt-2 text-[13px] font-normal text-slate-500">{sub}</p>
          ) : null}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClasses[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
