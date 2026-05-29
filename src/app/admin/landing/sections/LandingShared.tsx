import type { ReactNode } from 'react'
import { Info, Plus } from 'lucide-react'

export function InfoNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-[18px] border border-blue-100 bg-[#eef6ff] px-4 py-4 text-[15px] font-semibold leading-6 text-[#41619f]">
      <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        <Info size={18} />
      </span>
      <p>
        <span className="font-bold">Catatan:</span> {children}
      </p>
    </div>
  )
}

export function SectionHeader({
  summary,
  activeText,
  buttonLabel,
  onAdd,
}: {
  summary: string
  activeText?: string
  buttonLabel: string
  onAdd: () => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[18px] font-bold text-slate-900">
        {summary}
        {activeText ? (
          <>
            <span className="mx-3 font-semibold text-slate-400">•</span>
            <span className="font-semibold text-emerald-600">{activeText}</span>
          </>
        ) : null}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#6440f3] px-6 text-[16px] font-semibold text-white shadow-[0_10px_22px_rgba(100,64,243,0.28)] transition hover:bg-[#5834e5] active:scale-[0.98]"
      >
        <Plus size={18} />
        {buttonLabel}
      </button>
    </div>
  )
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? 'Aktif' : 'Nonaktif'}
    </span>
  )
}

export function EmptyCreateCard({
  title,
  description,
  onClick,
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[300px] flex-col items-center justify-center rounded-[18px] border border-dashed border-slate-300 bg-transparent px-8 text-center transition hover:border-brand-purple hover:bg-white/50"
    >
      <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#e8eefc] text-slate-600">
        <Plus size={28} />
      </span>
      <span className="text-[17px] font-bold text-slate-900">{title}</span>
      <span className="mt-2 max-w-[300px] text-[15px] leading-6 text-slate-500">{description}</span>
    </button>
  )
}

export function ActionButtonGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>
}
