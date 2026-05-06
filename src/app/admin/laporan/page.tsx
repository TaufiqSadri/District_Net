import Link from 'next/link'
import { Download } from 'lucide-react'
import { formatRupiah } from '@/lib/data/dashboardPelanggan'
import { getLaporanOverview, getLaporanPreview } from '@/lib/data/laporan'

const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

export default async function AdminLaporanPage() {
  const [overview, preview] = await Promise.all([getLaporanOverview(), getLaporanPreview()])

  const cards = [
    { label: 'Pelanggan Aktif', value: overview.pelangganAktif, sub: `${overview.totalPelanggan} total pelanggan` },
    { label: 'Tagihan Lunas', value: overview.tagihanLunas, sub: `${overview.totalTagihan} total tagihan` },
    { label: 'Menunggu Verifikasi', value: overview.tagihanMenungguVerifikasi, sub: 'Perlu dicek admin' },
    { label: 'Komplain Menunggu', value: overview.komplainMenunggu, sub: `${overview.totalKomplain} total komplain` },
  ]

  const exportLinks = [
    { label: 'Export Pelanggan', type: 'pelanggan' },
    { label: 'Export Tagihan', type: 'tagihan' },
    { label: 'Export Pembayaran', type: 'pembayaran' },
    { label: 'Export Komplain', type: 'komplain' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="mt-1 text-sm text-gray-500">Ringkasan operasional, review data terbaru, dan export laporan admin.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {exportLinks.map((item) => (
            <a
              key={item.type}
              href={`/admin/laporan/export?type=${item.type}`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Download size={14} />
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.label}</p>
            <p className="mt-3 font-display text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-gray-900">Review Keuangan</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Pendapatan Terverifikasi</p>
              <p className="mt-2 font-semibold text-green-700">{formatRupiah(overview.totalPendapatanTerverifikasi)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Total Tunggakan</p>
              <p className="mt-2 font-semibold text-red-600">{formatRupiah(overview.totalTunggakan)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Pelanggan Pending</p>
              <p className="mt-2 font-semibold text-yellow-700">{overview.pelangganPending}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Pelanggan Nonaktif</p>
              <p className="mt-2 font-semibold text-gray-700">{overview.pelangganNonaktif}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-gray-900">Review Operasional</h2>
          <div className="mt-5 space-y-3 text-sm text-gray-600">
            <div className="rounded-xl border border-gray-100 px-4 py-3">
              Ada <span className="font-semibold text-gray-900">{overview.tagihanBelumBayar}</span> tagihan belum dibayar di luar yang sedang diverifikasi.
            </div>
            <div className="rounded-xl border border-gray-100 px-4 py-3">
              Ada <span className="font-semibold text-gray-900">{overview.tagihanMenungguVerifikasi}</span> pembayaran yang sedang menunggu pemeriksaan admin.
            </div>
            <div className="rounded-xl border border-gray-100 px-4 py-3">
              Ada <span className="font-semibold text-gray-900">{overview.komplainMenunggu}</span> komplain pelanggan yang belum selesai.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-gray-900">Tagihan Terbaru</h2>
          <div className="mt-4 space-y-3">
            {preview.tagihan.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-gray-100 px-4 py-3 text-sm">
                <p className="font-semibold text-gray-900">{item.pelanggan?.nama_lengkap ?? '-'}</p>
                <p className="text-gray-500">
                  {bulanNama[item.bulan - 1]} {item.tahun} · {formatRupiah(item.jumlah_tagihan)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-gray-900">Pembayaran Terbaru</h2>
          <div className="mt-4 space-y-3">
            {preview.pembayaran.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-gray-100 px-4 py-3 text-sm">
                <p className="font-semibold text-gray-900">{item.tagihan?.pelanggan?.nama_lengkap ?? '-'}</p>
                <p className="text-gray-500">
                  {item.tagihan ? `${bulanNama[item.tagihan.bulan - 1]} ${item.tagihan.tahun}` : '-'} · {formatRupiah(item.jumlah_bayar)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-gray-900">Komplain Terbaru</h2>
          <div className="mt-4 space-y-3">
            {preview.komplain.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-gray-100 px-4 py-3 text-sm">
                <p className="font-semibold text-gray-900">{item.pelanggan?.nama_lengkap ?? '-'}</p>
                <p className="line-clamp-2 text-gray-500">{item.isi_komplain}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
