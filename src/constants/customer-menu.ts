import {
  History,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  User,
  Wifi,
} from 'lucide-react'

export const customerNavGroups = [
  {
    title: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Layanan',
    items: [
      { href: '/dashboard/paket', label: 'Paket Internet', icon: Wifi },
      { href: '/dashboard/tagihan', label: 'Tagihan', icon: Receipt },
    ],
  },
  {
    title: 'Aktivitas',
    items: [
      { href: '/dashboard/riwayat', label: 'Riwayat Bayar', icon: History },
      { href: '/dashboard/komplain', label: 'Komplain', icon: MessageSquare },
    ],
  },
  {
    title: 'Akun',
    items: [{ href: '/dashboard/profil', label: 'Profil Akun', icon: User }],
  },
]
