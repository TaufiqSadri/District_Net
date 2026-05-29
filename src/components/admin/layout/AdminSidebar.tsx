'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/(public)/login/actions'
import { LogOut, X } from 'lucide-react'
import { adminNavGroups, type AdminMenuBadgeKey } from '@/constants/admin-menu'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
  pendingCount: number
  paymentPendingCount: number
}

function formatBadge(count: number) {
  if (count > 99) return '99+'
  return String(count)
}

export default function AdminSidebar({
  open,
  onClose,
  pendingCount,
  paymentPendingCount,
}: AdminSidebarProps) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[300px] flex-shrink-0 overflow-hidden border-r border-slate-200 bg-[#68247b] lg:flex">
        <SidebarContent
          pendingCount={pendingCount}
          paymentPendingCount={paymentPendingCount}
        />
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[70] bg-slate-950/45 lg:hidden"
          aria-label="Tutup menu admin"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-[80] flex w-[min(300px,calc(100vw-2rem))] transform overflow-hidden bg-[#68247b] shadow-2xl transition duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          pendingCount={pendingCount}
          paymentPendingCount={paymentPendingCount}
          onNavigate={onClose}
          onClose={onClose}
        />
      </aside>
    </>
  )
}

function SidebarContent({
  pendingCount,
  paymentPendingCount,
  onNavigate,
  onClose,
}: {
  pendingCount: number
  paymentPendingCount: number
  onNavigate?: () => void
  onClose?: () => void
}) {
  const pathname = usePathname()

  const getBadge = (badgeKey?: AdminMenuBadgeKey) => {
    const count = badgeKey === 'payment' ? paymentPendingCount : pendingCount

    if (!badgeKey || count <= 0) return null

    return (
      <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
        {formatBadge(count)}
      </span>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between px-7 py-6">
        <Link href="/" aria-label="District Net home" onClick={onNavigate}>
          <Image
            src="/district_net.svg"
            alt="District Net"
            width={164}
            height={52}
            priority
            className="h-[52px] w-auto object-contain"
          />
        </Link>
        {onClose ? (
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu admin"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-[18px] pb-4 pt-4">
        <div className="flex flex-col gap-2">
          {adminNavGroups.map((group) => (
            <div key={group.title} className="overflow-hidden">
              <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-white/75">
                {group.title}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map(({ href, label, icon: Icon, badgeKey }) => {
                  const active =
                    pathname === href || (href !== '/admin' && pathname.startsWith(href))

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      className={`flex min-h-11 items-center gap-3 border-l-2 px-5 py-3 text-[14px] font-normal tracking-wide transition ${
                        active
                          ? 'rounded-r bg-[#eceef2] border-black text-[#6e2786]'
                          : 'rounded-r border-transparent text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                      <span className="truncate">{label}</span>
                      {getBadge(badgeKey)}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="px-[18px] pb-6">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 rounded-r border-l-2 border-transparent px-5 py-3 text-left text-[14px] font-normal tracking-wide text-white transition hover:bg-white/10"
          >
            <LogOut size={20} />
            Logout
          </button>
        </form>
      </div>
    </div>
  )
}
