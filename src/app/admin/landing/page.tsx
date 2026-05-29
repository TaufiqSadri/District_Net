import { createAdminClient } from '@/lib/supabase/admin'
import LandingPageContent from '@/app/admin/landing/sections/LandingPageContent'
import type { AreaLayanan, Faq, Iklan, PaketInternet, Promo } from '@/types/database'
import type { LandingTab } from '@/app/admin/landing/sections/LandingTabs'

type AreaRow = AreaLayanan & { id: string }

interface SearchParams {
  tab?: string
}

function getActiveTab(tab?: string): LandingTab {
  if (tab === 'paket' || tab === 'promo' || tab === 'faq' || tab === 'area') return tab
  return 'iklan'
}

export default async function AdminLandingPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const activeTab = getActiveTab(searchParams.tab)
  const admin = createAdminClient()

  const [iklans, paket, promos, faqs, areas] = await Promise.all([
    activeTab === 'iklan'
      ? admin.from('iklan').select('*').order('urutan').then((result) => (result.data ?? []) as Iklan[])
      : Promise.resolve([] as Iklan[]),
    activeTab === 'paket'
      ? admin.from('paket_internet').select('*').order('harga').then((result) => (result.data ?? []) as PaketInternet[])
      : Promise.resolve([] as PaketInternet[]),
    activeTab === 'promo'
      ? admin.from('promo').select('*').order('urutan').then((result) => (result.data ?? []) as Promo[])
      : Promise.resolve([] as Promo[]),
    activeTab === 'faq'
      ? admin.from('faq').select('*').order('urutan').then((result) => (result.data ?? []) as Faq[])
      : Promise.resolve([] as Faq[]),
    activeTab === 'area'
      ? admin.from('area_layanan').select('*').order('kecamatan').order('nagari').then((result) => (result.data ?? []) as AreaRow[])
      : Promise.resolve([] as AreaRow[]),
  ])

  return (
    <LandingPageContent
      activeTab={activeTab}
      iklans={iklans}
      paket={paket}
      promos={promos}
      faqs={faqs}
      areas={areas}
    />
  )
}
