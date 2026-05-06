import { CheckCircle2, Wifi } from 'lucide-react'
import { formatRupiah, getDashboardPelangganData } from '@/lib/data/dashboardPelanggan'

export default async function PaketPage() {
  const { pelanggan, paketAktif } = await getDashboardPelangganData()
  const paketSaatIni = pelanggan.paket_internet

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Paket Internet</h1>
        <p className="mt-1 text-sm text-gray-500">Lihat detail paket aktif Anda dan bandingkan dengan paket lain yang tersedia.</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-gray-900">Paket Anda Saat Ini</h2>
            <p className="mt-1 text-sm text-gray-500">Informasi paket yang sedang digunakan pada alamat pemasangan Anda.</p>
          </div>
          <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Aktif</div>
        </div>

        {paketSaatIni ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Nama Paket</p>
              <p className="mt-2 font-semibold text-gray-900">{paketSaatIni.nama_paket}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Kecepatan</p>
              <p className="mt-2 font-semibold text-gray-900">{paketSaatIni.kecepatan_mbps} Mbps</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Biaya Bulanan</p>
              <p className="mt-2 font-semibold text-gray-900">{formatRupiah(paketSaatIni.harga)}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Paket untuk akun Anda belum terhubung. Silakan hubungi admin.
          </div>
        )}

        {paketSaatIni?.deskripsi ? (
          <div className="mt-4 rounded-xl border border-gray-100 px-4 py-4 text-sm text-gray-600">
            {paketSaatIni.deskripsi}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-5">
          <h2 className="font-display text-lg font-semibold text-gray-900">Paket Lain yang Tersedia</h2>
          <p className="mt-1 text-sm text-gray-500">Untuk mengganti paket, silakan hubungi admin setelah memilih paket yang diinginkan.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paketAktif.map((paket) => {
            const isCurrent = paketSaatIni?.id === paket.id
            return (
              <div
                key={paket.id}
                className={`rounded-2xl border p-5 transition ${
                  isCurrent
                    ? 'border-brand-purple bg-purple-50/50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-gray-900">{paket.nama_paket}</h3>
                    <p className="mt-1 text-sm text-gray-500">{paket.kecepatan_mbps} Mbps</p>
                  </div>
                  <div className={`rounded-full p-2 ${isCurrent ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Wifi size={16} />
                  </div>
                </div>

                <p className="mb-4 text-2xl font-bold text-brand-purple">{formatRupiah(paket.harga)}</p>
                <p className="min-h-[48px] text-sm text-gray-500">{paket.deskripsi ?? 'Tidak ada deskripsi paket.'}</p>

                <div className="mt-5">
                  {isCurrent ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={14} />
                      Paket yang digunakan
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-100 px-3 py-2 text-xs text-gray-500">
                      Hubungi admin jika ingin beralih ke paket ini.
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
