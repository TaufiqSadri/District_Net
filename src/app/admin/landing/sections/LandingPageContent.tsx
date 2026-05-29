import type { AreaLayanan, Faq, Iklan, PaketInternet, Promo } from '@/types/database'
import BannerManager from '@/app/admin/landing/sections/managers/BannerManager'
import FAQManager from '@/app/admin/landing/sections/managers/FAQManager'
import PackageManager from '@/app/admin/landing/sections/managers/PackageManager'
import PromoManager from '@/app/admin/landing/sections/managers/PromoManager'
import ServiceAreaManager from '@/app/admin/landing/sections/managers/ServiceAreaManager'
import LandingTabs, { type LandingTab } from '@/app/admin/landing/sections/LandingTabs'
import { InfoNotice } from '@/app/admin/landing/sections/LandingShared'
import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'

type AreaRow = AreaLayanan & { id: string }

interface LandingPageContentProps {
  activeTab: LandingTab
  iklans: Iklan[]
  paket: PaketInternet[]
  promos: Promo[]
  faqs: Faq[]
  areas: AreaRow[]
}

const notices: Record<LandingTab, string> = {
  iklan: 'Iklan yang aktif akan tampil sebagai slider banner di halaman utama website. Urutkan sesuai keinginan tampilan.',
  paket: 'Paket yang aktif akan tampil di halaman package landing page.',
  promo: 'Promo yang aktif akan tampil pada halaman promo website',
  faq: 'Pertanyaan akan ditampilkan di halaman faq pada website.',
  area: 'Area yang dijangkau akan pada fitur check-location.',
}

export default function LandingPageContent({
  activeTab,
  iklans,
  paket,
  promos,
  faqs,
  areas,
}: LandingPageContentProps) {
  return (
    <div className="space-y-6">
      <PanelPageHeader 
      title='Kelola Landing'
      subtitle='Kelola konten yang tampil di halaman publik website.'
      />
      <LandingTabs activeTab={activeTab} />
      <InfoNotice>{notices[activeTab]}</InfoNotice>

      {activeTab === 'iklan' ? <BannerManager iklans={iklans} /> : null}
      {activeTab === 'paket' ? <PackageManager paketList={paket} /> : null}
      {activeTab === 'promo' ? <PromoManager promos={promos} /> : null}
      {activeTab === 'faq' ? <FAQManager faqs={faqs} /> : null}
      {activeTab === 'area' ? <ServiceAreaManager areas={areas} /> : null}
    </div>
  )
}
