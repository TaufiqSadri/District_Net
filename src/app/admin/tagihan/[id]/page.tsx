import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTagihanById } from '@/lib/data/tagihan'

const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

export default async function AdminTagihanDetailPage({ params }: { params: { id: string } }) {
  const tagihan = await getTagihanById(params.id)
  if (!tagihan) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/tagihan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Kembali ke Tagihan
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900">Detail Tagihan</h1>
              <p className="mt-1 text-sm text-gray-500">
                {bulanNama[tagihan.bulan - 1]} {tagihan.tahun}
              </p>
            </div>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple">
              {tagihan.status_tagihan.replaceAll('_', ' ')}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Pelanggan</p>
              <p className="mt-2 font-semibold text-gray-900">{tagihan.pelanggan?.nama_lengkap ?? '-'}</p>
              <p className="mt-1 text-sm text-gray-500">{tagihan.pelanggan?.email ?? '-'}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Nominal</p>
              <p className="mt-2 font-semibold text-gray-900">{fmt(tagihan.jumlah_tagihan)}</p>
              <p className="mt-1 text-sm text-gray-500">
                Jatuh tempo: {new Date(tagihan.jatuh_tempo).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-gray-900">Riwayat Pembayaran</h2>
            <Link
              href={`/admin/tagihan/${tagihan.id}/edit`}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Edit Tagihan
            </Link>
          </div>

          {tagihan.pembayaran.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
              Belum ada pembayaran untuk tagihan ini.
            </div>
          ) : (
            <div className="space-y-3">
              {tagihan.pembayaran.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-100 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">
                      {item.tanggal_pembayaran
                        ? new Date(item.tanggal_pembayaran).toLocaleString('id-ID')
                        : '-'}
                    </span>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      {item.status_verifikasi}
                    </span>
                  </div>
                  {item.bukti_pembayaran ? (
                    <a
                      href={item.bukti_pembayaran}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex font-semibold text-brand-purple hover:underline"
                    >
                      Lihat bukti pembayaran
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
