import Link from 'next/link'
import { HelpCircle, ImageIcon, MapPin, Package, Percent } from 'lucide-react'

export type LandingTab = 'iklan' | 'paket' | 'promo' | 'faq' | 'area'

interface LandingTabsProps {
  activeTab: LandingTab
}

const tabs: Array<{
  key: LandingTab
  label: string
  icon: typeof ImageIcon
}> = [
  { key: 'iklan', label: 'Iklan Banner', icon: ImageIcon },
  { key: 'paket', label: 'Paket Internet', icon: Package },
  { key: 'promo', label: 'Promo', icon: Percent },
  { key: 'faq', label: 'FAQ', icon: HelpCircle },
  { key: 'area', label: 'Area Layanan', icon: MapPin },
]

export default function LandingTabs({ activeTab }: LandingTabsProps) {
  return (
    <nav className="grid w-full grid-cols-1 gap-2 rounded-[18px] border border-[#e5e7eb] bg-white p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:grid-cols-2 xl:grid-cols-5">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = activeTab === tab.key

        return (
          <Link
            key={tab.key}
            href={`/admin/landing?tab=${tab.key}`}
            prefetch={false}
            className={`inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition ${
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
