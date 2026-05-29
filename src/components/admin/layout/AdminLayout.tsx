'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'
import AdminTopbar, { type AdminTopbarUser } from '@/components/admin/layout/AdminTopbar'

interface AdminLayoutProps {
  children: ReactNode
  pendingCount: number
  paymentPendingCount: number
  user: AdminTopbarUser
}

export default function AdminLayout({
  children,
  pendingCount,
  paymentPendingCount,
  user,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f9fd] font-[var(--font-source-sans-pro)] text-slate-900 lg:flex">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
        paymentPendingCount={paymentPendingCount}
      />
      <div className="flex min-h-screen flex-1 flex-col lg:min-w-0">
        <AdminTopbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1220px] px-4 py-6 sm:px-6 lg:px-9 lg:py-9">
            {children}
          </div>
        </main>
        <footer className="mx-auto flex w-full max-w-[1220px] flex-col gap-3 px-4 pb-7 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[#111c2d]/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-9">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>System Operational: High Integrity Mode</span>
          </div>
          <span className="font-medium normal-case">(c) 2024 District Net Indonesia. v2.4.0</span>
        </footer>
      </div>
    </div>
  )
}
