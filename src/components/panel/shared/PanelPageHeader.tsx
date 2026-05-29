import type { ReactNode } from 'react'

interface PanelPageHeaderProps {
  eyebrow?: string
  title: string
  subtitle: string
  action?: ReactNode
}

export default function PanelPageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: PanelPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[13px] font-medium text-[#6741f5]">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-[30px] font-bold leading-tight text-[#111827]">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-[15px] font-normal text-slate-600">
          {subtitle}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
