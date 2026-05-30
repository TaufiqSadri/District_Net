'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

interface PanelToastProps {
  message: string | null
  tone?: 'success' | 'error'
}

export default function PanelToast({
  message,
  tone = 'success',
}: PanelToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const timeout = window.setTimeout(() => setVisible(false), 3200)
    return () => window.clearTimeout(timeout)
  }, [message])

  if (!message || !visible) return null

  const isSuccess = tone === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle

  return (
    <div
      role="status"
      className={`fixed right-4 top-4 z-[120] flex max-w-sm items-start gap-3 rounded-[18px] border bg-white px-4 py-3 text-[14px] font-semibold shadow-2xl ${
        isSuccess
          ? 'border-emerald-200 text-emerald-700'
          : 'border-red-200 text-red-700'
      }`}
    >
      <Icon size={18} className="mt-0.5 flex-shrink-0" />
      <span className="leading-5">{message}</span>
    </div>
  )
}
