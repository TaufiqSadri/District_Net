import Link from 'next/link'
import StatCard from '@/components/StatCard'
import { getDashboardPelangganData, formatPeriode, formatRupiah, getStatusTagihanMeta } from '@/lib/data/dashboardPelanggan'
import { AlertCircle, CheckCircle2, Receipt } from 'lucide-react'

export default async function TagihanPage() {
  const { tagihan } = await getDashboardPelangganData()

  const totalTagihan = tagihan.length
  const belumBayar = tagihan.filter((item) => item.status_tagihan === 'belum_bayar')
  const menungguVerifikasi = tagihan.filter((item) => item.status_tagihan === 'menunggu_verifikasi')
  const totalTunggakan = belumBayar.reduce((sum, item) => sum + item.jumlah_tagihan, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Tagihan</h1>
        <p className="mt-1 text-sm text-gray-500">Lihat semua tagihan, jatuh tempo, dan status pembayaran Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Total Tagihan"
          value={totalTagihan}
          sub="Seluruh periode tagihan"
          icon={<Receipt size={16} className="text-brand-purple" />}
          iconBg="bg-purple-100"
        />
        <StatCard
          label="Belum Dibayar"
          value={belumBayar.length}
          sub={formatRupiah(totalTunggakan)}
          icon={<AlertCircle size={16} className="text-red-600" />}
          iconBg="bg-red-100"
          valueColor="text-red-600"
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={menungguVerifikasi.length}
          sub="Sedang dicek admin"
          icon={<CheckCircle2 size={16} className="text-yellow-600" />}
          iconBg="bg-yellow-100"
          valueColor="text-yellow-600"
        />
      </div>

      <div className="rounded-2xl bg-white shadow-card">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-display text-lg font-semibold text-gray-900">Daftar Tagihan</h2>
          <p className="mt-1 text-sm text-gray-500">Klik detail untuk mengirim bukti pembayaran pada tagihan yang belum dibayar.</p>
        </div>

        {tagihan.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Belum ada tagihan untuk akun Anda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-6 pb-3 pt-5">Periode</th>
                  <th className="px-6 pb-3 pt-5">Jatuh Tempo</th>
                  <th className="px-6 pb-3 pt-5">Jumlah</th>
                  <th className="px-6 pb-3 pt-5">Status</th>
                  <th className="px-6 pb-3 pt-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tagihan.map((item) => {
                  const badge = getStatusTagihanMeta(item.status_tagihan)
                  return (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4 font-medium text-gray-700">{formatPeriode(item.bulan, item.tahun)}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.jatuh_tempo ? new Date(item.jatuh_tempo).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{formatRupiah(item.jumlah_tagihan)}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/tagihan/${item.id}`}
                          className="inline-flex rounded-lg border border-brand-purple/20 px-3 py-1.5 text-xs font-semibold text-brand-purple transition hover:bg-brand-purple/5"
                        >
                          {item.status_tagihan === 'belum_bayar' ? 'Bayar Sekarang' : 'Lihat Detail'}
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
