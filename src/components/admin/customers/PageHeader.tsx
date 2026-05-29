import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export default function PageHeader() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-slate-900">
          Kelola Pelanggan
        </h1>
        <p className="mt-2 text-[15px] font-normal text-slate-600">
          Manajemen data pelanggan dan status layanan internet di seluruh distrik.
        </p>
      </div>
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
