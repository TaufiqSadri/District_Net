import type { ReactNode } from 'react'
import type { PanelTone } from '@/components/panel/shared/PanelMetricCard'

const toneClasses: Record<PanelTone, string> = {
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
  slate: 'bg-slate-50 text-slate-700 ring-slate-100',
}

interface PanelStatusBadgeProps {
  children: ReactNode
  tone?: PanelTone
  icon?: ReactNode
  dot?: boolean
  className?: string
  dotClassName?: string
  minWidthClass?: string
  textClassName?: string
  uppercase?: boolean
  centered?: boolean
  ring?: boolean
}

export default function PanelStatusBadge({
  children,
  tone = 'slate',
  icon,
  dot = true,
  className,
  dotClassName,
  minWidthClass = 'w-fit',
  textClassName = 'text-[12px]',
  uppercase,
  centered,
  ring = true,
}: PanelStatusBadgeProps) {
  return (
    <span
      className={`inline-flex ${minWidthClass} items-center gap-1.5 rounded-full px-3 py-1 ${textClassName} font-semibold ${
        centered ? 'justify-center' : ''
      } ${uppercase ? 'uppercase' : ''} ${ring ? 'ring-1' : ''} ${className ?? toneClasses[tone]}`}
    >
      {icon ?? (
        dot ? <span className={`h-1.5 w-1.5 rounded-full ${dotClassName ?? 'bg-current'}`} /> : null
      )}
      {children}
    </span>
  )
}
