import PanelPageHeader from '@/components/panel/shared/PanelPageHeader'
import {
  getDashboardPelangganData,
} from '@/lib/data/dashboardPelanggan'
import { createClient } from '@/lib/supabase/server'
import { getCurrentPelanggan } from '@/lib/data/pelanggan'
import type { TagihanInstalasi, TagihanRow } from '@/types/database'
import { redirect } from 'next/navigation'
import BillingSummarySection from './sections/BillingSummarySection'
import BillingTableSection, {
  type UnifiedTagihan,
} from './sections/BillingTableSection'
import InstallationBillingNotice from './sections/InstallationBillingNotice'

export default async function TagihanPage() {
  const pelanggan = await getCurrentPelanggan()
  if (!pelanggan) redirect('/login')

  const supabase = await createClient()

  const [{ tagihan }, { data: instalasiRaw }] = await Promise.all([
    getDashboardPelangganData().then((data) => ({ tagihan: data.tagihan })),
    supabase
      .from('tagihan_instalasi')
      .select('*')
      .eq('pelanggan_id', pelanggan.id)
      .order('created_at', { ascending: false }),
  ])

  const tagihanInstalasi = (instalasiRaw ?? []) as TagihanInstalasi[]
  const tagihanInstalasiAktif =
    tagihanInstalasi.find((item) => item.status_tagihan !== 'lunas') ?? null
  const instalasiNotice =
    tagihanInstalasiAktif?.status_tagihan === 'menunggu_verifikasi'
      ? {
          title: 'Pembayaran Instalasi Sedang Diverifikasi',
          message:
            'Bukti pembayaran instalasi Anda sudah dikirim. Admin akan memeriksa pembayaran terlebih dahulu, lalu tim District Net akan menghubungi Anda untuk konfirmasi jadwal pemasangan.',
          action: 'Lihat Detail Instalasi',
        }
      : {
          title: 'Menunggu Pembayaran Instalasi',
          message:
            'Pendaftaran Anda sudah disetujui. Selesaikan pembayaran instalasi agar tim District Net dapat memproses jadwal pemasangan di alamat pemasangan Anda.',
          action: 'Bayar Instalasi',
        }

  const unified: UnifiedTagihan[] = [
    ...tagihan.map((data) => ({ type: 'bulanan' as const, data })),
    ...tagihanInstalasi.map((data) => ({ type: 'instalasi' as const, data })),
  ].sort(
    (a, b) =>
      new Date(b.data.created_at).getTime() -
      new Date(a.data.created_at).getTime(),
  )

  const belumBayarBulanan = tagihan.filter((item) => item.status_tagihan === 'belum_bayar')
  const belumBayarInstalasi = tagihanInstalasi.filter(
    (item) => item.status_tagihan === 'belum_bayar',
  )
  const menungguBulanan = tagihan.filter(
    (item) => item.status_tagihan === 'menunggu_verifikasi',
  )
  const menungguInstalasi = tagihanInstalasi.filter(
    (item) => item.status_tagihan === 'menunggu_verifikasi',
  )

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Tagihan"
        subtitle="Lihat semua tagihan, jatuh tempo, dan status pembayaran Anda."
      />

      <InstallationBillingNotice
        suspended={pelanggan.status_langganan === 'ditangguhkan'}
        activeInstallationBill={tagihanInstalasiAktif}
        notice={instalasiNotice}
      />

      <BillingSummarySection
        totalTagihan={tagihan.length + tagihanInstalasi.length}
        totalBelumBayar={belumBayarBulanan.length + belumBayarInstalasi.length}
        totalTunggakan={
          belumBayarBulanan.reduce((sum, item) => sum + item.jumlah_tagihan, 0) +
          belumBayarInstalasi.reduce((sum, item) => sum + item.jumlah_tagihan, 0)
        }
        totalMenunggu={menungguBulanan.length + menungguInstalasi.length}
      />

      <BillingTableSection rows={unified} />
    </div>
  )
}
