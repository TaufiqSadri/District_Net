'use client'

import { usePathname } from 'next/navigation'

const adminPageNames = [
  { prefix: '/admin/pelanggan', label: 'Pelanggan' },
  { prefix: '/admin/tagihan', label: 'Tagihan' },
  { prefix: '/admin/verifikasi', label: 'Verifikasi Pembayaran' },
  { prefix: '/admin/jadwal-instalasi', label: 'Jadwal Instalasi' },
  { prefix: '/admin/landing', label: 'Landing Page' },
  { prefix: '/admin/komplain', label: 'Komplain' },
  { prefix: '/admin/laporan', label: 'Laporan' },
]

export default function BreadcrumbHeader() {
  const pathname = usePathname()
  const page = adminPageNames.find((item) => pathname.startsWith(item.prefix))

  return (
    <nav aria-label="Breadcrumb" className="truncate text-[15px] font-normal text-slate-700">
      <span>Admin Panel</span>
      {page ? (
        <>
          <span className="mx-2 text-slate-400">→</span>
          <span className="font-medium text-slate-800">{page.label}</span>
        </>
      ) : null}
    </nav>
  )
}
