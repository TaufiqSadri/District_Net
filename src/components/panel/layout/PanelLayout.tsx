'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import PanelSidebar from '@/components/panel/layout/PanelSidebar'
import PanelTopbar, {
  type PanelTopbarUser,
} from '@/components/panel/layout/PanelTopbar'
import type { PanelVariant } from '@/components/panel/layout/PanelBreadcrumb'
import type { PanelNotification } from '@/components/panel/layout/PanelNotificationDrawer'

interface PanelLayoutProps {
  children: ReactNode
  variant: PanelVariant
  user: PanelTopbarUser
  badgeCounts?: Partial<Record<string, number>>
  notifications?: PanelNotification[]
  notificationUnreadCount?: number
  footerStatus?: string
}

export default function PanelLayout({
  children,
  variant,
  user,
  badgeCounts,
  notifications,
  notificationUnreadCount,
  footerStatus = variant === 'admin'
    ? 'System Operational: High Integrity Mode'
    : 'Layanan Pelanggan: Aktif',
}: PanelLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f9fd] font-[var(--font-source-sans-pro)] text-slate-900 lg:flex">
      <PanelAutoRefresh />
      <PanelSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant={variant}
        user={user}
        badgeCounts={badgeCounts}
      />
      <div className="flex min-h-screen flex-1 flex-col lg:min-w-0">
        <PanelTopbar
          variant={variant}
          user={user}
          notifications={notifications}
          notificationUnreadCount={notificationUnreadCount}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1220px] px-4 py-6 sm:px-6 lg:px-9 lg:py-9">
            {children}
          </div>
        </main>
        <footer className="mx-auto flex w-full max-w-[1220px] flex-col gap-3 px-4 pb-7 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[#111c2d]/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-9">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{footerStatus}</span>
          </div>
          <span className="font-medium normal-case">(c) 2026 District Net Indonesia. v2.4.0</span>
        </footer>
      </div>
    </div>
  )
}

function PanelAutoRefresh() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastRefreshAtRef = useRef(0)
  const currentUrl = useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams],
  )

  useEffect(() => {
    router.refresh()
  }, [currentUrl, router])

  useEffect(() => {
    function refreshIfNeeded() {
      const now = Date.now()
      if (now - lastRefreshAtRef.current < 2_000) return
      lastRefreshAtRef.current = now
      router.refresh()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') refreshIfNeeded()
    }

    window.addEventListener('focus', refreshIfNeeded)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', refreshIfNeeded)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  return null
}
