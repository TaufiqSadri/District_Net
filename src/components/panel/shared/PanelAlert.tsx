import type { ReactNode } from 'react'

type PanelAlertTone = 'success' | 'error' | 'warning' | 'info'

const alertClasses: Record<PanelAlertTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
}

interface PanelAlertProps {
  tone: PanelAlertTone
  children: ReactNode
  action?: ReactNode
}

export default function PanelAlert({
  tone,
  children,
  action,
}: PanelAlertProps) {
  return (
    <div className={`rounded-[18px] border px-4 py-3 text-[14px] font-medium ${alertClasses[tone]}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="leading-6">{children}</div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  )
}
