import type { TagihanStatus } from '@/lib/data/tagihan'
import type { StatusLangganan } from '@/types/database'

export const customerStatusConfig: Record<
  StatusLangganan,
  { label: string; className: string; dotClassName: string }
> = {
  aktif: {
    label: 'Aktif',
    className: 'bg-emerald-100 text-emerald-600',
    dotClassName: 'bg-emerald-500',
  },
  ditangguhkan: {
    label: 'Ditangguhkan',
    className: 'bg-slate-100 text-slate-500',
    dotClassName: 'bg-slate-400',
  },
  proses_instalasi: {
    label: 'Proses Instalasi',
    className: 'bg-amber-100 text-amber-600',
    dotClassName: 'bg-amber-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-violet-100 text-violet-600',
    dotClassName: 'bg-violet-500',
  },
  nonaktif: {
    label: 'Nonaktif',
    className: 'bg-red-100 text-red-600',
    dotClassName: 'bg-red-500',
  },
}

export const billingStatusConfig: Record<
  TagihanStatus,
  { label: string; className: string; dotClassName: string }
> = {
  belum_bayar: {
    label: 'Belum Dibayar',
    className: 'bg-red-50 text-red-700',
    dotClassName: 'bg-red-600',
  },
  menunggu_verifikasi: {
    label: 'Menunggu Verifikasi',
    className: 'bg-amber-50 text-amber-700',
    dotClassName: 'bg-amber-500',
  },
  lunas: {
    label: 'Lunas',
    className: 'bg-emerald-50 text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-rose-50 text-rose-700',
    dotClassName: 'bg-rose-600',
  },
}

export const verificationStatusConfig: Record<
  string,
  { label: string; className: string; dotClassName: string }
> = {
  diterima: {
    label: 'Lunas',
    className: 'bg-emerald-50 text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
  lunas: {
    label: 'Lunas',
    className: 'bg-emerald-50 text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
  menunggu: {
    label: 'Menunggu',
    className: 'bg-lime-50 text-lime-700',
    dotClassName: 'bg-lime-500',
  },
  ditolak: {
    label: 'Ditolak',
    className: 'bg-red-50 text-red-700',
    dotClassName: 'bg-red-500',
  },
  belum_bayar: {
    label: 'Belum Dibayar',
    className: 'bg-red-50 text-red-700',
    dotClassName: 'bg-red-500',
  },
}
