import DashboardOverviewContent from '@/app/dashboard/sections/DashboardOverviewContent'
import { createClient } from '@/lib/supabase/server'
import { getCurrentPelanggan } from '@/lib/data/pelanggan'
import { getLatestJadwalInstalasiForPelanggan } from '@/lib/data/jadwalInstalasi'
import type { PembayaranRow, TagihanInstalasi, TagihanRow } from '@/types/database'
import { redirect } from 'next/navigation'

type PembayaranWithTagihan = PembayaranRow & {
  tagihan: { bulan: number; tahun: number } | null
}

export default async function DashboardPelangganPage() {
  const pelanggan = await getCurrentPelanggan()
  if (!pelanggan) redirect('/login')
  if (pelanggan.status_langganan === 'pending') redirect('/dashboard/pending')
  if (pelanggan.status_langganan === 'nonaktif') redirect('/dashboard/nonaktif')

  const now = new Date()
  const supabase = await createClient()

  const [
    { data: tagihanBulanIni },
    { data: tagihanRows },
    pembayaranRows,
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
      .from('tagihan')
      .select('*')
      .eq('pelanggan_id', pelanggan.id)
      .order('created_at', { ascending: false })
      .limit(5),
    Promise.all([
      supabase
        .from('pembayaran')
        .select('*, tagihan!inner(bulan, tahun, pelanggan_id)')
        .eq('tagihan.pelanggan_id', pelanggan.id)
        .order('created_at', { ascending: false })
        .limit(5)
        .then((result) => (result.data ?? []) as PembayaranWithTagihan[]),
      supabase
        .from('pembayaran')
        .select('*, tagihan_instalasi!inner(id, pelanggan_id)')
        .eq('tagihan_instalasi.pelanggan_id', pelanggan.id)
        .order('created_at', { ascending: false })
        .limit(5)
        .then((result) => (result.data ?? []) as PembayaranWithTagihan[]),
    ]).then(([bulanan, instalasi]) => {
      const merged = [...bulanan, ...instalasi]
      merged.sort(
        (a, b) =>
          new Date(b.tanggal_pembayaran).getTime() -
          new Date(a.tanggal_pembayaran).getTime(),
      )
      return merged.slice(0, 5)
    }),
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
      tagihanRows={(tagihanRows ?? []) as TagihanRow[]}
      pembayaranRows={pembayaranRows}
      tagihanInstalasi={tagihanInstalasi as TagihanInstalasi | null}
      jadwalInstalasi={jadwalInstalasi}
    />
  )
}
