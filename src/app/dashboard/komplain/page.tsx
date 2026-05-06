import { MessageSquareMore, Send } from 'lucide-react'
import { createKomplain } from '@/app/dashboard/actions'
import { getDashboardPelangganData, getStatusKomplainMeta } from '@/lib/data/dashboardPelanggan'

export default async function KomplainPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string }
}) {
  const { komplain } = await getDashboardPelangganData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Komplain</h1>
        <p className="mt-1 text-sm text-gray-500">Sampaikan kendala layanan agar tim admin bisa segera menindaklanjuti.</p>
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

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-2">
            <Send size={16} className="text-brand-purple" />
            <h2 className="font-display text-lg font-semibold text-gray-900">Kirim Komplain Baru</h2>
          </div>

          <form action={createKomplain} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Isi Komplain</label>
              <textarea
                name="isi_komplain"
                rows={8}
                required
                minLength={10}
                placeholder="Contoh: Internet sering putus sejak tadi pagi dan lampu LOS berkedip merah."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              Jelaskan kendala sejelas mungkin agar admin lebih cepat membantu.
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-pink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-pink-dark"
            >
              <Send size={15} />
              Kirim Komplain
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-2">
            <MessageSquareMore size={16} className="text-brand-purple" />
            <h2 className="font-display text-lg font-semibold text-gray-900">Riwayat Komplain</h2>
          </div>

          {komplain.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-400">
              Anda belum pernah mengirim komplain.
            </div>
          ) : (
            <div className="space-y-4">
              {komplain.map((item) => {
                const badge = getStatusKomplainMeta(item.status)
                return (
                  <div key={item.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        {item.tanggal
                          ? new Date(item.tanggal).toLocaleString('id-ID')
                          : item.created_at
                            ? new Date(item.created_at).toLocaleString('id-ID')
                            : '-'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-gray-600">{item.isi_komplain}</p>

                    {item.respon_admin ? (
                      <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
                        <span className="font-semibold">Respon admin:</span> {item.respon_admin}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
