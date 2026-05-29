import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  href: string
  icon: ReactNode
  iconBgClass: string
  badge?: {
    label: string
    className: string
  }
  detailLabel?: string
  helper?: string
}

export default function StatCard({
  label,
  value,
  href,
  icon,
  iconBgClass,
  badge,
  detailLabel = 'Lihat detail',
  helper,
}: StatCardProps) {
  return (
    <article className="overflow-hidden rounded-[18px] border border-[#dfe5ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="p-6 pb-5">
        <div className="flex items-start gap-4">
          <div className={`flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}>
            {icon}
          </div>
          <h3 className="min-h-[44px] pt-2 text-[15px] font-semibold leading-5 text-slate-950">
            {label}
          </h3>
        </div>
        <div className="mt-6 flex min-h-8 items-center gap-3">
          <p className="text-[30px] font-normal leading-none text-slate-900">
            {value}
          </p>
          {badge ? (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          ) : null}
          {helper ? <span className="text-sm font-normal text-slate-500">{helper}</span> : null}
        </div>
      </div>
      <Link
        href={href}
        className="flex h-11 items-center justify-between border-t border-[#dfe5ef] bg-[#fbfcfe] px-4 text-[13px] font-normal text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
      >
        <span>{detailLabel}</span>
        <ArrowRight size={24} className="text-slate-500" />
      </Link>
    </article>
  )
}
