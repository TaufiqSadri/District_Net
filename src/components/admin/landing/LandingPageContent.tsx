import type { AreaLayanan, Faq, Iklan, PaketInternet, Promo } from '@/types/database'
import { AreaManager, FaqManager, IklanManager, PaketManager, PromoManager } from '@/app/admin/landing/LandingManagers'
import LandingTabs, { type LandingTab } from '@/components/admin/landing/LandingTabs'
import { InfoNotice } from '@/components/admin/landing/LandingShared'

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
      <LandingTabs activeTab={activeTab} />
      <InfoNotice>{notices[activeTab]}</InfoNotice>

      {activeTab === 'iklan' ? <IklanManager iklans={iklans} /> : null}
      {activeTab === 'paket' ? <PaketManager paketList={paket} /> : null}
      {activeTab === 'promo' ? <PromoManager promos={promos} /> : null}
      {activeTab === 'faq' ? <FaqManager faqs={faqs} /> : null}
      {activeTab === 'area' ? <AreaManager areas={areas} /> : null}
    </div>
  )
}
