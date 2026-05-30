'use client'

import { useState } from 'react'
import Link from 'next/link'
import { markNotificationAsReadAction } from '@/app/dashboard/notification-actions'
import {
  Bell,
  CalendarClock,
  ChevronDown,
  CircleAlert,
  Clock,
  Receipt,
  Wrench,
  X,
} from 'lucide-react'

export type PanelNotification = {
  id: string
  title: string
  summary: string
  time: string
  tone: 'purple' | 'pink' | 'blue' | 'yellow' | 'orange' | 'green' | 'red'
  icon: 'wrench' | 'receipt' | 'alert' | 'clock' | 'calendar'
  status?: string
  href?: string
  actionLabel?: string
  details?: Array<{ label: string; value: string }>
  isUnread?: boolean
  canMarkRead?: boolean
}

type Props = {
  notifications: PanelNotification[]
  unreadCount?: number
}

const toneClass: Record<PanelNotification['tone'], { icon: string; badge: string; border: string }> = {
  purple: {
    icon: 'bg-purple-100 text-brand-purple',
    badge: 'bg-purple-50 text-brand-purple',
    border: 'border-purple-100',
  },
  pink: {
    icon: 'bg-pink-100 text-brand-pink',
    badge: 'bg-pink-50 text-brand-pink',
    border: 'border-pink-100',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-700',
    badge: 'bg-blue-50 text-blue-700',
    border: 'border-blue-100',
  },
  yellow: {
    icon: 'bg-yellow-100 text-yellow-700',
    badge: 'bg-yellow-50 text-yellow-700',
    border: 'border-yellow-100',
  },
  orange: {
    icon: 'bg-orange-100 text-orange-700',
    badge: 'bg-orange-50 text-orange-700',
    border: 'border-orange-100',
  },
  green: {
    icon: 'bg-green-100 text-green-700',
    badge: 'bg-green-50 text-green-700',
    border: 'border-green-100',
  },
  red: {
    icon: 'bg-red-100 text-red-700',
    badge: 'bg-red-50 text-red-700',
    border: 'border-red-100',
  },
}

const iconMap: Record<PanelNotification['icon'], typeof Wrench> = {
  wrench: Wrench,
  receipt: Receipt,
  alert: CircleAlert,
  clock: Clock,
  calendar: CalendarClock,
}

export default function PanelNotificationDrawer({ notifications, unreadCount }: Props) {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(
    notifications.find((item) => item.href || item.details?.length || (item.canMarkRead && item.isUnread))?.id ?? null,
  )

  const count = notifications.length
  const unreadTotal = unreadCount ?? notifications.filter((item) => item.isUnread).length

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
        aria-label="Buka notifikasi pelanggan"
      >
        <Bell size={21} />
        {unreadTotal > 0 ? (
          <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-600" />
        ) : null}
      </button>

      {open ? (
        <button
          type="button"
          aria-label="Tutup notifikasi"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[75] bg-slate-950/45"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 right-0 z-[80] flex w-[min(29rem,100vw)] flex-col bg-[#f7f9fd] shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="border-b border-[#e2e8f0] bg-white px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-semibold text-slate-900">Pengumuman</h2>
              <p className="mt-1 text-sm text-slate-500">
                {unreadTotal > 0 ? `${unreadTotal} notifikasi baru` : 'Tidak ada notifikasi baru'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe5ef] text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Tutup notifikasi"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {count === 0 ? (
            <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-5 text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
              Belum ada pengumuman penting untuk akun Anda.
            </div>
          ) : null}

          {notifications.map((item) => {
            const Icon = iconMap[item.icon]
            const tone = toneClass[item.tone]
            const canMarkRead = Boolean(item.canMarkRead && item.isUnread)
            const canExpand = Boolean(item.href || item.details?.length || canMarkRead)
            const expanded = expandedId === item.id

            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-[18px] border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${tone.border}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (canExpand) setExpandedId(expanded ? null : item.id)
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-4 text-left ${
                    canExpand ? 'transition hover:bg-slate-50' : 'cursor-default'
                  }`}
                >
                  <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${tone.icon}`}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold leading-snug text-slate-900">
                      {item.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-5 text-slate-500">
                      {item.summary}
                    </span>
                    <span className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Clock size={13} />
                        {item.time}
                      </span>
                      {item.status ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                          {item.status}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  {canExpand ? (
                    <ChevronDown
                      size={17}
                      className={`mt-1 flex-shrink-0 text-slate-400 transition ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  ) : null}
                </button>

                {canExpand && expanded ? (
                  <div className="border-t border-[#e5e7eb] px-4 py-4">
                    {item.details && item.details.length > 0 ? (
                      <div className="grid gap-2">
                        {item.details.map((detail) => (
                          <div
                            key={`${item.id}-${detail.label}`}
                            className="rounded-xl bg-[#f8faff] px-3 py-2"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              {detail.label}
                            </p>
                            <p className="mt-1 text-sm font-medium leading-5 text-gray-800">
                              {detail.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">{item.summary}</p>
                    )}

                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#6741f5] px-4 text-sm font-semibold text-white transition hover:bg-[#5b2fd6]"
                      >
                        {item.actionLabel ?? 'Lihat Detail'}
                      </Link>
                    ) : null}

                    {canMarkRead ? (
                      <form action={markNotificationAsReadAction} className="mt-4">
                        <input type="hidden" name="notification_id" value={item.id} />
                        <button
                          type="submit"
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#dfe5ef] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Tandai dibaca
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </aside>
    </>
  )
}
