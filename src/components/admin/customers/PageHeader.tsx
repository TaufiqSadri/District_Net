import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'

export default function PageHeader() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <PanelPageHeader 
      title='Kelola Pelanggan'
      subtitle='Manajemen data pelanggan dan status layanan internet di seluruh distrik.'
      />
      <Link
        href="/admin/pelanggan/createPelanggan"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6d3df2] px-6 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(109,61,242,0.25)] transition hover:bg-[#5b2fd6] active:scale-[0.98]"
      >
        <UserPlus size={17} />
        Tambah Pelanggan
      </Link>
    </div>
  )
}
