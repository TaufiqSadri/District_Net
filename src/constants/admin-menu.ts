import {
  BarChart2,
  CheckCircle,
  CreditCard,
  Globe,
  LayoutDashboard,
  MessageSquare,
  Users,
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
      { href: '/admin/jadwal-instalasi', label: 'Jadwal', icon: Wrench },
    ],
  },
  {
    title: 'Service',
    items: [
      {
        href: '/admin/komplain',
        label: 'Komplain',
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
