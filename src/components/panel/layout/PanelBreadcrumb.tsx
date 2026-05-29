'use client'

import { usePathname } from 'next/navigation'

export type PanelVariant = 'admin' | 'customer'

const pageNames: Record<PanelVariant, Array<{ prefix: string; label: string }>> = {
  admin: [
    { prefix: '/admin/pelanggan', label: 'Pelanggan' },
    { prefix: '/admin/tagihan', label: 'Tagihan' },
    { prefix: '/admin/verifikasi', label: 'Verifikasi Pembayaran' },
    { prefix: '/admin/jadwal-instalasi', label: 'Jadwal Instalasi' },
    { prefix: '/admin/landing', label: 'Landing Page' },
    { prefix: '/admin/komplain', label: 'Komplain' },
    { prefix: '/admin/laporan', label: 'Laporan' },
  ],
  customer: [
    { prefix: '/dashboard/paket', label: 'Paket Internet' },
    { prefix: '/dashboard/tagihan-instalasi', label: 'Tagihan Instalasi' },
    { prefix: '/dashboard/tagihan', label: 'Tagihan' },
    { prefix: '/dashboard/riwayat', label: 'Riwayat Bayar' },
    { prefix: '/dashboard/komplain', label: 'Komplain' },
    { prefix: '/dashboard/profil', label: 'Profil Akun' },
    { prefix: '/dashboard/pending', label: 'Menunggu Verifikasi' },
    { prefix: '/dashboard/nonaktif', label: 'Akun Nonaktif' },
  ],
}

const rootLabels: Record<PanelVariant, string> = {
  admin: 'Admin Panel',
  customer: 'Pelanggan Panel',
}

export default function PanelBreadcrumb({ variant }: { variant: PanelVariant }) {
  const pathname = usePathname()
  const page = pageNames[variant].find((item) => pathname.startsWith(item.prefix))

  return (
    <nav aria-label="Breadcrumb" className="truncate text-[15px] font-normal text-slate-700">
      <span>{rootLabels[variant]}</span>
      {page ? (
        <>
          <span className="mx-2 text-slate-400">→</span>
          <span className="font-medium text-slate-800">{page.label}</span>
        </>
      ) : null}
    </nav>
  )
}
