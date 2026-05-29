'use client'

import { Bell, Menu, Settings, UserCircle } from 'lucide-react'
import PanelBreadcrumb, {
  type PanelVariant,
} from '@/components/panel/layout/PanelBreadcrumb'
import PanelNotificationDrawer, {
  type PanelNotification,
} from '@/components/panel/layout/PanelNotificationDrawer'

export interface PanelTopbarUser {
  name: string
  roleLabel: string
  email?: string
  avatarUrl?: string | null
}

interface PanelTopbarProps {
  variant: PanelVariant
  user: PanelTopbarUser
  notifications?: PanelNotification[]
  onMenuClick: () => void
}

export default function PanelTopbar({
  variant,
  user,
  notifications = [],
  onMenuClick,
}: PanelTopbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-9">
        <button
          type="button"
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label={variant === 'admin' ? 'Buka menu admin' : 'Buka menu pelanggan'}
          onClick={onMenuClick}
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0 flex-1">
          <PanelBreadcrumb variant={variant} />
        </div>

        <div className="ml-auto flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {variant === 'customer' ? (
            <PanelNotificationDrawer notifications={notifications} />
          ) : (
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
              aria-label="Notifikasi"
            >
              <Bell size={21} />
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-600" />
            </button>
          )}
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 sm:inline-flex"
            aria-label="Pengaturan"
          >
            <Settings size={21} />
          </button>
          <div className="hidden h-9 w-px bg-slate-200 sm:block" />
          <div className="hidden text-right sm:block">
            <p className="text-[13px] font-medium text-slate-800">{user.name}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{user.roleLabel}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[13px] bg-slate-900 text-white shadow-sm">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserCircle size={27} />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
