import StatCard from '@/components/StatCard'
import { createClient } from '@/lib/supabase/server'
import { getCurrentPelanggan } from '@/lib/data/pelanggan'
import type { PembayaranRow, TagihanRow } from '@/types/database'
import { CheckCircle, Receipt, Wifi } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type PembayaranWithTagihan = PembayaranRow & {
  tagihan: { bulan: number; tahun: number } | null
}

const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPelangganPage() {
  const pelanggan = await getCurrentPelanggan()
  if (!pelanggan) redirect('/login')
  if (pelanggan.status_langganan === 'pending') redirect('/dashboard/pending')
  if (pelanggan.status_langganan === 'nonaktif') redirect('/dashboard/nonaktif')

  const now = new Date()
  const supabase = await createClient()

  // Kick off all queries in parallel — no waterfall between sections
  const [tagihanBulanIni, tagihanRows, pembayaranRows] = await Promise.all([
    supabase
      .from('tagihan')
      .select('jumlah_tagihan, status_tagihan')
      .eq('pelanggan_id', pelanggan.id)
      .eq('bulan', now.getMonth() + 1)
      .eq('tahun', now.getFullYear())
      .maybeSingle()
      .then((r) => r.data),
    supabase
      .from('tagihan')
      .select('*')
      .eq('pelanggan_id', pelanggan.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then((r) => (r.data ?? []) as TagihanRow[]),
    supabase
      .from('pembayaran')
      .select('*, tagihan!inner(bulan, tahun, pelanggan_id)')
      .eq('tagihan.pelanggan_id', pelanggan.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then((r) => (r.data ?? []) as PembayaranWithTagihan[]),
  ])

  const paket = pelanggan.paket_internet

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      belum_bayar: 'bg-red-100 text-red-700',
      menunggu_verifikasi: 'bg-yellow-100 text-yellow-700',
      lunas: 'bg-green-100 text-green-700',
    }
    const label: Record<string, string> = {
      belum_bayar: 'Belum Bayar',
      menunggu_verifikasi: 'Menunggu Verifikasi',
      lunas: 'Lunas',
    }
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
        {label[s] ?? s}
      </span>
    )
  }

  const verifikasiBadge = (s: string) => {
    const map: Record<string, string> = {
      menunggu: 'bg-yellow-100 text-yellow-700',
      diterima: 'bg-green-100 text-green-700',
      ditolak: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Selamat datang, {pelanggan.nama_lengkap.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {' · '}
          <span className="font-medium text-brand-purple">
            {pelanggan.paket_internet?.nama_paket ?? 'Paket tidak ditemukan'}
          </span>
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Paket Aktif"
          value={`${paket?.kecepatan_mbps ?? '-'} Mbps`}
          sub={`${paket?.nama_paket ?? '-'} · ${fmt(paket?.harga ?? 0)}/bln`}
          icon={<Wifi size={16} className="text-brand-purple" />}
          iconBg="bg-purple-100"
        />
        <StatCard
          label={`Tagihan ${bulanNama[now.getMonth()]} ${now.getFullYear()}`}
          value={tagihanBulanIni ? fmt(tagihanBulanIni.jumlah_tagihan) : 'Belum ada'}
          sub={tagihanBulanIni?.status_tagihan ?? ''}
          icon={<Receipt size={16} className="text-brand-pink" />}
          iconBg="bg-pink-100"
          valueColor={tagihanBulanIni?.status_tagihan === 'lunas' ? 'text-green-600' : 'text-gray-900'}
        />
        <StatCard
          label="Status Langganan"
          value="Aktif"
          sub={`Bergabung ${new Date(pelanggan.tanggal_bergabung).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          })}`}
          icon={<CheckCircle size={16} className="text-green-600" />}
          iconBg="bg-green-100"
          valueColor="text-green-600"
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tagihan */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-gray-900">Tagihan Terbaru</h2>
            <Link href="/dashboard/tagihan" className="text-xs font-semibold text-brand-pink hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-3">Periode</th>
                <th className="pb-3">Jumlah</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tagihanRows.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 text-gray-700">
                    {bulanNama[t.bulan - 1]} {t.tahun}
                  </td>
                  <td className="py-3 font-medium text-gray-700">{fmt(t.jumlah_tagihan)}</td>
                  <td className="py-3">{statusBadge(t.status_tagihan)}</td>
                  <td className="py-3">
                    {t.status_tagihan === 'belum_bayar' ? (
                      <Link
                        href={`/dashboard/tagihan/${t.id}`}
                        className="rounded-lg bg-brand-pink px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-pink-dark"
                      >
                        Upload
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
              {tagihanRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-gray-400">
                    Belum ada tagihan
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pembayaran */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-gray-900">Riwayat Pembayaran</h2>
            <Link href="/dashboard/riwayat" className="text-xs font-semibold text-brand-pink hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-3">Tanggal</th>
                <th className="pb-3">Jumlah</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pembayaranRows.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 text-gray-700">
                    {new Date(p.tanggal_pembayaran).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 font-medium text-gray-700">{fmt(p.jumlah_bayar)}</td>
                  <td className="py-3">{verifikasiBadge(p.status_verifikasi)}</td>
                </tr>
              ))}
              {pembayaranRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-gray-400">
                    Belum ada pembayaran
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}