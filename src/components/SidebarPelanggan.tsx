'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/(public)/login/actions'
import {
  LayoutDashboard,
  Wifi,
  Receipt,
  History,
  MessageSquare,
  User,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/paket', label: 'Paket Internet', icon: Wifi },
  { href: '/dashboard/tagihan', label: 'Tagihan', icon: Receipt },
  { href: '/dashboard/riwayat', label: 'Riwayat Bayar', icon: History },
  { href: '/dashboard/komplain', label: 'Komplain', icon: MessageSquare },
  { href: '/dashboard/profil', label: 'Profil Akun', icon: User },
]

interface Props {
  namaLengkap: string
  email: string
}

export default function SidebarPelanggan({ namaLengkap, email }: Props) {
  const pathname = usePathname()
  const initials = namaLengkap
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="flex min-h-screen w-64 flex-shrink-0 flex-col bg-brand-purple px-4 py-6">
      <div className="mb-6 px-3">
        <span className="font-display text-2xl font-bold text-white">
          Distric<span className="text-brand-yellow">.</span>
        </span>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-yellow font-display text-sm font-bold text-gray-900">
          {initials}
        </div>
        <div className="min-w-0 overflow-hidden">
          <p className="truncate text-sm font-semibold text-white">{namaLengkap}</p>
          <p className="truncate text-xs text-white/50">{email}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
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
            </Link>
          )
        })}
      </nav>

      <form action={logoutAction}>
        <button
          type="submit"
          className="mt-4 flex w-full items-center gap-3 rounded-xl border-t border-white/10 px-3 py-2.5 pt-4 text-sm font-medium text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </form>
    </aside>
  )
}
