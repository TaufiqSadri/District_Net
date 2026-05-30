import {
  BarChart2,
  CheckCircle,
  CreditCard,
  Globe,
  History,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  User,
  Users,
  Wifi,
  Wrench,
} from 'lucide-react'

export type AdminMenuBadgeKey = 'payment' | 'pending'

export const adminNavGroups = [
  {
    title: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Website',
    items: [{ href: '/admin/landing', label: 'Landing Page', icon: Globe }],
  },
  {
    title: 'Operational',
    items: [
      { href: '/admin/pelanggan', label: 'Pelanggan', icon: Users },
      { href: '/admin/tagihan', label: 'Tagihan', icon: CreditCard },
      {
        href: '/admin/verifikasi',
        label: 'Verifikasi Pembayaran',
        icon: CheckCircle,
        badgeKey: 'payment' as const,
      },
      { href: '/admin/jadwal-instalasi', label: 'Jadwal Layanan', icon: Wrench },
    ],
  },
  {
    title: 'Service',
    items: [
      {
        href: '/admin/tiket',
        label: 'Tiket Layanan',
        icon: MessageSquare,
        badgeKey: 'pending' as const,
      },
    ],
  },
  {
    title: 'Analytics',
    items: [{ href: '/admin/laporan', label: 'Laporan', icon: BarChart2 }],
  },
]

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
      { href: '/dashboard/tiket', label: 'Tiket Layanan', icon: MessageSquare },
    ],
  },
  {
    title: 'Akun',
    items: [{ href: '/dashboard/profil', label: 'Profil Akun', icon: User }],
  },
]
