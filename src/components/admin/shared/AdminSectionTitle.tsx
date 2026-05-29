import type { ReactNode } from 'react'

interface AdminSectionTitleProps {
  icon?: ReactNode
  title: string
  subtitle?: string
}

export default function AdminSectionTitle({
  icon,
  title,
  subtitle,
}: AdminSectionTitleProps) {
  return (
    <div className="flex items-start gap-3">
      {icon ? (
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-[#eee8ff] text-[#6741f5]">
          {icon}
        </div>
      ) : null}
      <div>
        <h2 className="text-[20px] font-semibold text-[#111827]">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-[14px] font-normal text-slate-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}
