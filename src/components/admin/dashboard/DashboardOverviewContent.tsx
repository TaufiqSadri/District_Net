import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  CreditCard,
  Receipt,
  UserPlus,
  Users,
  Wifi,
  Wrench,
} from 'lucide-react'
import StatCard from '@/components/admin/dashboard/StatCard'
import StatusDistributionCard from '@/components/admin/dashboard/StatusDistributionCard'
import BillingStatusCard from '@/components/admin/dashboard/BillingStatusCard'
import InstallationActivityCard from '@/components/admin/dashboard/InstallationActivityCard'
import ComplaintStatsCard from '@/components/admin/dashboard/ComplaintStatsCard'
import RegistrationTable, {
  type NewRegistrationRow,
} from '@/components/admin/dashboard/RegistrationTable'
import RecentActivityCard, {
  type RecentActivityItem,
} from '@/components/admin/dashboard/RecentActivityCard'
import {
  buildSignupBars,
  customerStatusItems,
  formatCompactRupiah,
  formatDashboardDate,
} from '@/components/admin/dashboard/dashboardOverviewUtils'
import type { KomplainStats } from '@/lib/data/komplain'

interface DashboardOverviewContentProps {
  now: Date
  totalPelanggan: number
  pelangganAktif: number
  pelangganPending: number
  pelangganDitangguhkan: number
  pelangganProsesInstalasi: number
  pelangganNonaktif: number
  newSignupsThisMonth: number
  signups: Array<{ created_at: string }>
  currentRevenue: number
  revenueChange: string
  activeRate: number
  billingTotals: {
    paid: number
    waiting: number
    unpaid: number
  }
  paidPercent: number
  unpaidBillCount: number
  komplainStats: KomplainStats
  registrations: NewRegistrationRow[]
  activities: RecentActivityItem[]
}

export default function DashboardOverviewContent({
  now,
  totalPelanggan,
  pelangganAktif,
  pelangganPending,
  pelangganDitangguhkan,
  pelangganProsesInstalasi,
  pelangganNonaktif,
  newSignupsThisMonth,
  signups,
  currentRevenue,
  revenueChange,
  activeRate,
  billingTotals,
  paidPercent,
  unpaidBillCount,
  komplainStats,
  registrations,
  activities,
}: DashboardOverviewContentProps) {
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-[15px] font-medium text-slate-500">
            {formatDashboardDate(now)}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
          <QuickAction href="/admin/pelanggan/createPelanggan" icon={<UserPlus size={18} />}>
            Tambah Pelanggan
          </QuickAction>
          <QuickAction href="/admin/tagihan/generate" icon={<Receipt size={18} />}>
            Buat Tagihan
          </QuickAction>
          <QuickAction href="/admin/jadwal-instalasi" icon={<Wrench size={18} />}>
            Jadwal Instalasi
          </QuickAction>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Pelanggan"
          value={totalPelanggan}
          href="/admin/pelanggan"
          icon={<Users size={23} className="text-[#5427e6]" />}
          iconBgClass="bg-violet-100"
          badge={{
            label: `+${newSignupsThisMonth}`,
            className: 'bg-emerald-100 text-emerald-600',
          }}
        />
        <StatCard
          label="Pelanggan Aktif"
          value={pelangganAktif}
          href="/admin/pelanggan?status=aktif"
          icon={<Wifi size={23} className="text-blue-600" />}
          iconBgClass="bg-blue-100"
          badge={{
            label: `${activeRate}% aktif`,
            className: 'bg-blue-100 text-blue-600',
          }}
        />
        <StatCard
          label="Pendapatan Bulan Ini"
          value={formatCompactRupiah(currentRevenue, true)}
          href="/admin/laporan"
          icon={<CreditCard size={24} className="text-emerald-500" />}
          iconBgClass="bg-emerald-100"
          badge={{
            label: revenueChange,
            className: revenueChange.startsWith('-')
              ? 'bg-red-100 text-red-600'
              : 'bg-emerald-100 text-emerald-600',
          }}
        />
        <StatCard
          label="Tagihan Tertunggak"
          value={unpaidBillCount}
          href="/admin/tagihan?status=belum_bayar"
          icon={<AlertTriangle size={24} className="text-red-600" />}
          iconBgClass="bg-red-100"
          helper={`(${formatCompactRupiah(billingTotals.unpaid)})`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)]">
        <StatusDistributionCard
          items={customerStatusItems.map((item) => ({
            label: item.label,
            colorClass: item.colorClass,
            value:
              item.key === 'aktif'
                ? pelangganAktif
                : item.key === 'pending'
                ? pelangganPending
                : item.key === 'proses_instalasi'
                ? pelangganProsesInstalasi
                : item.key === 'ditangguhkan'
                ? pelangganDitangguhkan
                : pelangganNonaktif,
          }))}
        />
        <BillingStatusCard
          paidAmount={billingTotals.paid}
          waitingAmount={billingTotals.waiting}
          unpaidAmount={billingTotals.unpaid}
          paidPercent={paidPercent}
          formatCurrency={(value) => formatCompactRupiah(value)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InstallationActivityCard
          newSignups={newSignupsThisMonth}
          bars={buildSignupBars(signups)}
        />
        <ComplaintStatsCard
          resolved={komplainStats.selesai}
          unresolved={komplainStats.menunggu}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(320px,1fr)]">
        <RegistrationTable rows={registrations} />
        <RecentActivityCard items={activities} />
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  children,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center gap-3 rounded-[14px] border border-[#dfe5ef] bg-white px-5 text-sm font-semibold text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:border-brand-purple/30 hover:text-brand-purple"
    >
      <span className="text-[#5427e6]">{icon}</span>
      <span className="whitespace-nowrap">{children}</span>
    </Link>
  )
}
