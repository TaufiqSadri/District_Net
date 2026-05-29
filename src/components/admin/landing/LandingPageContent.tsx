import type { AreaLayanan, Faq, Iklan, PaketInternet, Promo } from '@/types/database'
import BannerManager from '@/components/admin/landing/managers/BannerManager'
import FAQManager from '@/components/admin/landing/managers/FAQManager'
import PackageManager from '@/components/admin/landing/managers/PackageManager'
import PromoManager from '@/components/admin/landing/managers/PromoManager'
import ServiceAreaManager from '@/components/admin/landing/managers/ServiceAreaManager'
import LandingTabs, { type LandingTab } from '@/components/admin/landing/LandingTabs'
import { InfoNotice } from '@/components/admin/landing/LandingShared'
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader'

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
      <AdminPageHeader 
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
