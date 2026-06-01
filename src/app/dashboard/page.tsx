import DashboardOverviewContent from '@/app/dashboard/sections/DashboardOverviewContent'
import { createClient } from '@/lib/supabase/server'
import { getDashboardPelangganData } from '@/lib/data/dashboardPelanggan'
import { getLatestJadwalInstalasiForPelanggan } from '@/lib/data/jadwalInstalasi'
import type { TagihanInstalasi } from '@/types/database'

export default async function DashboardPelangganPage() {
  const { pelanggan, tagihan, pembayaran } = await getDashboardPelangganData()

  const now = new Date()
  const supabase = await createClient()

  const [
    { data: tagihanBulanIni },
    { data: tagihanInstalasi },
    jadwalInstalasi,
  ] = await Promise.all([
    supabase
      .from('tagihan')
      .select('jumlah_tagihan, status_tagihan')
      .eq('pelanggan_id', pelanggan.id)
      .eq('bulan', now.getMonth() + 1)
      .eq('tahun', now.getFullYear())
      .maybeSingle(),
    supabase
      .from('tagihan_instalasi')
      .select('*')
      .eq('pelanggan_id', pelanggan.id)
      .maybeSingle(),
    getLatestJadwalInstalasiForPelanggan(pelanggan.id),
  ])

  return (
    <DashboardOverviewContent
      now={now}
      pelanggan={pelanggan}
      tagihanBulanIni={
        tagihanBulanIni as { jumlah_tagihan: number; status_tagihan: string } | null
      }
      tagihanRows={tagihan.slice(0, 5)}
      pembayaranRows={pembayaran.slice(0, 5)}
      tagihanInstalasi={tagihanInstalasi as TagihanInstalasi | null}
      jadwalInstalasi={jadwalInstalasi}
    />
  )
}
