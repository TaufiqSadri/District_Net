import { Clock, CheckCircle, XCircle } from 'lucide-react'
import type { VerificationStats } from '@/lib/data/pembayaran'

interface Props {
  stats: VerificationStats
}

const cards = [
  {
    key: 'menunggu' as const,
    label: 'Menunggu Verifikasi',
    icon: Clock,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    valueColor: 'text-yellow-600',
    sub: 'Perlu ditindaklanjuti',
  },
  {
    key: 'approvedHariIni' as const,
    label: 'Approve Hari Ini',
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    valueColor: 'text-green-600',
    sub: 'Berhasil diverifikasi',
  },
  {
    key: 'rejectedHariIni' as const,
    label: 'Reject Hari Ini',
    icon: XCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    valueColor: 'text-red-500',
    sub: 'Ditolak hari ini',
  },
]

export default function VerificationStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map(({ key, label, icon: Icon, iconBg, iconColor, valueColor, sub }) => (
        <div key={key} className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon size={16} className={iconColor} />
            </div>
          </div>
          <p className={`font-display text-2xl font-bold ${valueColor}`}>
            {stats[key].toLocaleString('id-ID')}
          </p>
          <p className="mt-1 text-xs text-gray-400">{sub}</p>
        </div>
      ))}
    </div>
  )
}