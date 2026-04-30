'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/(public)/login/actions'
import {
  LayoutDashboard,
  Users,
  Wifi,
  Receipt,
  CheckCircle,
  MessageSquare,
  BarChart2,
  LogOut,
} from 'lucide-react'

interface Props {
  pendingCount?: number
  paymentPendingCount?: number
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pelanggan', label: 'Kelola Pelanggan', icon: Users },
  { href: '/admin/paket', label: 'Kelola Paket', icon: Wifi },
  { href: '/admin/tagihan', label: 'Kelola Tagihan', icon: Receipt },
  {
    href: '/admin/verifikasi',
    label: 'Verifikasi Pembayaran',
    icon: CheckCircle,
    badgeKey: 'payment' as const,
  },
  {
    href: '/admin/komplain',
    label: 'Kelola Komplain',
    icon: MessageSquare,
    badgeKey: 'pending' as const,
  },
  { href: '/admin/laporan', label: 'Laporan', icon: BarChart2 },
]

export default function SidebarAdmin({
  pendingCount = 0,
  paymentPendingCount = 0,
}: Props) {
  const pathname = usePathname()

  const getBadge = (badgeKey?: 'payment' | 'pending') => {
    if (badgeKey === 'payment' && paymentPendingCount > 0) {
      return (
        <span className="ml-auto rounded-full bg-brand-yellow px-2 py-0.5 text-xs font-bold text-gray-900">
          {paymentPendingCount}
        </span>
      )
    }
    if (badgeKey === 'pending' && pendingCount > 0) {
      return (
        <span className="ml-auto rounded-full bg-white/30 px-2 py-0.5 text-xs font-bold text-white">
          {pendingCount}
        </span>
      )
    }
    return null
  }

  return (
    <aside className="flex min-h-screen w-64 flex-shrink-0 flex-col bg-brand-pink px-4 py-6">
      <div className="mb-2 px-3">
        <span className="font-display text-2xl font-bold text-white">
          Distric<span className="text-brand-yellow">.</span>
        </span>
      </div>
      <div className="mb-6 px-3">
        <span className="text-xs font-medium uppercase tracking-widest text-white/60">
          Admin Panel
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, badgeKey }) => {
          const active =
            pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
              {getBadge(badgeKey)}
            </Link>
          )
        })}
      </nav>

      <form action={logoutAction}>
        <button
          type="submit"
          className="mt-4 flex w-full items-center gap-3 rounded-xl border-t border-white/20 px-3 py-2.5 pt-4 text-sm font-medium text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </form>
    </aside>
  )
}
