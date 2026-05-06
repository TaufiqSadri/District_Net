import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CircleAlert, FileText, ReceiptText } from 'lucide-react'
import { submitPembayaran } from '@/app/dashboard/actions'
import { formatPeriode, formatRupiah, getStatusTagihanMeta, getStatusVerifikasiMeta, getTagihanDetailForCurrentPelanggan } from '@/lib/data/dashboardPelanggan'

export default async function TagihanDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { success?: string; error?: string }
}) {
  const detail = await getTagihanDetailForCurrentPelanggan(params.id)

  if (!detail) notFound()

  const { tagihan, pembayaran } = detail
  const badge = getStatusTagihanMeta(tagihan.status_tagihan)
  const latestPayment = pembayaran[0]
  const canSubmitPayment = tagihan.status_tagihan === 'belum_bayar'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/tagihan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Kembali ke Tagihan
        </Link>
      </div>

      {searchParams?.success ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {searchParams.success}
        </div>
      ) : null}

      {searchParams?.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchParams.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900">Detail Tagihan</h1>
              <p className="mt-1 text-sm text-gray-500">{formatPeriode(tagihan.bulan, tagihan.tahun)}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Nominal Tagihan</p>
              <p className="mt-2 font-display text-2xl font-bold text-gray-900">{formatRupiah(tagihan.jumlah_tagihan)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">Jatuh Tempo</p>
              <p className="mt-2 text-base font-semibold text-gray-900">
                {tagihan.jatuh_tempo ? new Date(tagihan.jatuh_tempo).toLocaleDateString('id-ID') : 'Belum diatur'}
              </p>
            </div>
          </div>

          {latestPayment ? (
            <div className="mt-6 rounded-xl border border-gray-100 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ReceiptText size={16} className="text-brand-purple" />
                <h2 className="font-semibold text-gray-900">Pembayaran Terakhir</h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Tanggal Bayar</span>
                  <span className="font-medium text-gray-700">
                    {new Date(latestPayment.tanggal_pembayaran).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Jumlah</span>
                  <span className="font-medium text-gray-700">{formatRupiah(latestPayment.jumlah_bayar)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Status Verifikasi</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusVerifikasiMeta(latestPayment.status_verifikasi).className}`}>
                    {getStatusVerifikasiMeta(latestPayment.status_verifikasi).label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Bukti</span>
                  {latestPayment.bukti_pembayaran ? (
                    <a
                      href={latestPayment.bukti_pembayaran}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-purple hover:underline"
                    >
                      Buka Link
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                {latestPayment.catatan_admin ? (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span className="font-semibold">Catatan admin:</span> {latestPayment.catatan_admin}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-gray-900">Kirim Bukti Pembayaran</h2>
            <p className="mt-1 text-sm text-gray-500">
              Gunakan link Google Drive atau link file publik lain yang bisa diakses admin.
            </p>
          </div>

          {canSubmitPayment ? (
            <form action={submitPembayaran} className="space-y-4">
              <input type="hidden" name="tagihan_id" value={tagihan.id} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Jumlah Bayar</label>
                <input
                  name="jumlah_bayar"
                  type="number"
                  min={0}
                  defaultValue={tagihan.jumlah_tagihan}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Link Bukti Pembayaran</label>
                <input
                  name="bukti_pembayaran"
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                />
              </div>

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Pastikan link file dapat dibuka oleh admin agar verifikasi tidak tertunda.
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-pink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-pink-dark"
              >
                Kirim Pembayaran
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-600">
              <div className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                <CircleAlert size={16} className="text-brand-purple" />
                Pembayaran tidak dapat dikirim ulang
              </div>
              <p>
                Tagihan ini sedang diproses atau sudah lunas. Jika ada kendala, silakan hubungi admin.
              </p>
            </div>
          )}

          {pembayaran.length > 1 ? (
            <div className="mt-6 rounded-xl border border-gray-100 p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText size={16} className="text-brand-purple" />
                <h3 className="font-semibold text-gray-900">Riwayat Pengiriman</h3>
              </div>
              <div className="space-y-3">
                {pembayaran.map((item) => (
                  <div key={item.id} className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">
                        {new Date(item.tanggal_pembayaran).toLocaleString('id-ID')}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusVerifikasiMeta(item.status_verifikasi).className}`}>
                        {getStatusVerifikasiMeta(item.status_verifikasi).label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
