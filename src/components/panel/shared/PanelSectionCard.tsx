import type { ReactNode } from 'react'

interface PanelSectionCardProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export default function PanelSectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: PanelSectionCardProps) {
  const hasHeader = Boolean(title || subtitle || action)

  return (
    <section className={`overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${className ?? ''}`}>
      {hasHeader ? (
        <div className="border-b border-[#e5e7eb] bg-white px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title ? (
                <h2 className="text-[20px] font-semibold text-[#111827]">{title}</h2>
              ) : null}
              {subtitle ? (
                <p className="mt-1 text-[14px] font-normal text-slate-500">{subtitle}</p>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </div>
      ) : null}
      <div className={bodyClassName ?? 'p-6'}>{children}</div>
    </section>
  )
}
