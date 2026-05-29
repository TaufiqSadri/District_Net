import Link from 'next/link'
import { ReceiptText, Wifi } from 'lucide-react'

export type BillingTabKey = 'bulanan' | 'instalasi'

interface BillingTabsProps {
  activeTab: BillingTabKey
  searchParams: Record<string, string | undefined>
}

const tabs: Array<{
  key: BillingTabKey
  label: string
  icon: typeof ReceiptText
}> = [
  { key: 'bulanan', label: 'Tagihan Bulanan', icon: ReceiptText },
  { key: 'instalasi', label: 'Tagihan Instalasi', icon: Wifi },
]

export default function BillingTabs({ activeTab, searchParams }: BillingTabsProps) {
  return (
    <nav className="grid w-full grid-cols-1 gap-2 rounded-[18px] border border-[#e5e7eb] bg-white p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:grid-cols-2">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = activeTab === tab.key

        return (
          <Link
            key={tab.key}
            href={createTabHref(searchParams, tab.key)}
            prefetch={false}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition ${
              active
                ? 'bg-[#6440f3] text-white shadow-[0_8px_18px_rgba(100,64,243,0.25)]'
                : 'bg-white text-slate-500 hover:bg-[#f1f4fc] hover:text-slate-800'
            }`}
          >
            <Icon size={16} />
            <span className="truncate">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function createTabHref(searchParams: Record<string, string | undefined>, target: BillingTabKey) {
  const params = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })

  params.delete('page')
  params.delete('jenis')
  params.delete('bulan')
  params.delete('tahun')
  params.delete('paket_id')

  if (target === 'instalasi') {
    params.set('jenis', 'instalasi')
  }

  const query = params.toString()
  return query ? `/admin/tagihan?${query}` : '/admin/tagihan'
}
