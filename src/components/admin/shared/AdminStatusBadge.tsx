import type { ReactNode } from 'react'
import type { AdminTone } from '@/components/admin/shared/AdminMetricCard'

const toneClasses: Record<AdminTone, string> = {
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
  slate: 'bg-slate-50 text-slate-700 ring-slate-100',
}

interface AdminStatusBadgeProps {
  children: ReactNode
  tone?: AdminTone
  icon?: ReactNode
  dot?: boolean
}

export default function AdminStatusBadge({
  children,
  tone = 'slate',
  icon,
  dot = true,
}: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ${toneClasses[tone]}`}
    >
      {icon ?? (dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null)}
      {children}
    </span>
  )
}
