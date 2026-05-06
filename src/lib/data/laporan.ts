import { createAdminClient } from '@/lib/supabase/admin'

export interface LaporanOverview {
  totalPelanggan: number
  pelangganAktif: number
  pelangganPending: number
  pelangganNonaktif: number
  totalTagihan: number
  tagihanBelumBayar: number
  tagihanMenungguVerifikasi: number
  tagihanLunas: number
  totalPendapatanTerverifikasi: number
  totalTunggakan: number
  totalKomplain: number
  komplainMenunggu: number
}

function isOverdue(status: string, jatuhTempo: string | null) {
  if (!jatuhTempo || status === 'lunas') return false
  const due = new Date(jatuhTempo)
  due.setHours(23, 59, 59, 999)
  return due.getTime() < Date.now()
}

export async function getLaporanOverview(): Promise<LaporanOverview> {
  const admin = createAdminClient()

  const [
    pelangganRows,
    tagihanRows,
    pembayaranRows,
    komplainRows,
  ] = await Promise.all([
    admin.from('pelanggan').select('status_langganan'),
    admin.from('tagihan').select('status_tagihan, jumlah_tagihan, jatuh_tempo'),
    admin.from('pembayaran').select('status_verifikasi, jumlah_bayar'),
    admin.from('komplain').select('status'),
  ])

  const pelanggan = pelangganRows.data ?? []
  const tagihan = tagihanRows.data ?? []
  const pembayaran = pembayaranRows.data ?? []
  const komplain = komplainRows.data ?? []

  return {
    totalPelanggan: pelanggan.length,
    pelangganAktif: pelanggan.filter((item) => item.status_langganan === 'aktif').length,
    pelangganPending: pelanggan.filter((item) => item.status_langganan === 'pending').length,
    pelangganNonaktif: pelanggan.filter((item) => item.status_langganan === 'nonaktif').length,
    totalTagihan: tagihan.length,
    tagihanBelumBayar: tagihan.filter(
      (item) => item.status_tagihan === 'belum_bayar' && !isOverdue(item.status_tagihan, item.jatuh_tempo),
    ).length,
    tagihanMenungguVerifikasi: tagihan.filter((item) => item.status_tagihan === 'menunggu_verifikasi').length,
    tagihanLunas: tagihan.filter((item) => item.status_tagihan === 'lunas').length,
    totalPendapatanTerverifikasi: pembayaran
      .filter((item) => item.status_verifikasi === 'diterima')
      .reduce((sum, item) => sum + item.jumlah_bayar, 0),
    totalTunggakan: tagihan
      .filter((item) => item.status_tagihan !== 'lunas')
      .reduce((sum, item) => sum + item.jumlah_tagihan, 0),
    totalKomplain: komplain.length,
    komplainMenunggu: komplain.filter((item) => !item.status).length,
  }
}

export async function getLaporanPreview() {
  const admin = createAdminClient()

  const [{ data: tagihan }, { data: pembayaran }, { data: komplain }] = await Promise.all([
    admin
      .from('tagihan')
      .select('*, pelanggan(nama_lengkap, email)')
      .order('tahun', { ascending: false })
      .order('bulan', { ascending: false })
      .limit(8),
    admin
      .from('pembayaran')
      .select('*, tagihan(bulan, tahun, pelanggan(nama_lengkap))')
      .order('tanggal_pembayaran', { ascending: false })
      .limit(8),
    admin
      .from('komplain')
      .select('*, pelanggan(nama_lengkap)')
      .order('tanggal', { ascending: false })
      .limit(8),
  ])

  return {
    tagihan: tagihan ?? [],
    pembayaran: pembayaran ?? [],
    komplain: komplain ?? [],
  }
}
