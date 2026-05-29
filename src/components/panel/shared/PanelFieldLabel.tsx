import type { ReactNode } from 'react'

interface PanelFieldLabelProps {
  label: string
  className?: string
  children: ReactNode
}

export default function PanelFieldLabel({
  label,
  className,
  children,
}: PanelFieldLabelProps) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  )
}
