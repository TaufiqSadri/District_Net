import Link from 'next/link'
import RegistrationActions from '@/app/admin/sections/RegistrationActions'

export interface NewRegistrationRow {
  id: string
  name: string
  email: string
  packageLabel: string
  status: string
}

interface RegistrationTableProps {
  rows: NewRegistrationRow[]
}

const statusStyles: Record<string, { label: string; className: string }> = {
  aktif: {
    label: 'Aktif',
    className: 'bg-emerald-100 text-emerald-600',
  },
  pending: {
    label: 'Menunggu Aktivasi',
    className: 'bg-amber-100 text-amber-600',
  },
  proses_instalasi: {
    label: 'Proses Instalasi',
    className: 'bg-amber-100 text-amber-600',
  },
  ditangguhkan: {
    label: 'Ditangguhkan',
    className: 'bg-slate-100 text-slate-500',
  },
  nonaktif: {
    label: 'Nonaktif',
    className: 'bg-slate-100 text-slate-500',
  },
}

export default function RegistrationTable({ rows }: RegistrationTableProps) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#dfe5ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-4 px-6 py-7 sm:px-8">
        <h2 className="text-[22px] font-normal text-slate-800">Pendaftaran Baru</h2>
        <Link
          href="/admin/pelanggan"
          className="text-sm font-medium text-brand-purple transition hover:text-brand-pink"
        >
          Lihat Semua
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="bg-[#f3f6fb] text-[12px] font-medium uppercase text-slate-500">
              <th className="px-8 py-5">Nama</th>
              <th className="px-6 py-5">Paket</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-8 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const style = statusStyles[row.status] ?? statusStyles.nonaktif

              return (
                <tr key={row.id} className="border-t border-[#e2e8f0]">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${avatarClass(row.name)}`}>
                        {initials(row.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800">{row.name}</p>
                        <p className="truncate text-xs font-medium text-slate-500">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-pre-line px-6 py-5 font-medium leading-6 text-slate-800">
                    {row.packageLabel}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${row.status === 'pending' ? 'whitespace-nowrap' : ''} ${style.className}`}>
                      {style.label}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <RegistrationActions id={row.id} name={row.name} status={row.status} />
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-10 text-center text-sm text-slate-400">
                  Tidak ada data pendaftaran baru.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function initials(name: string) {
  const value = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return value || 'DN'
}

function avatarClass(name: string) {
  const index = (name.charCodeAt(0) || 0) % 4
  const classes = [
    'bg-violet-100 text-violet-600',
    'bg-blue-100 text-blue-600',
    'bg-red-100 text-red-600',
    'bg-emerald-100 text-emerald-600',
  ]

  return classes[index]
}
