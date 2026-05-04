import { deactivatePelanggan } from '@/app/admin/actions'
import { createAdminClient } from '@/lib/supabase/admin'

type Pelanggan = {
  id: string
  nama_lengkap: string
  email: string
  no_hp: string
  status_langganan: string
  paket_internet: {
    nama_paket: string
    kecepatan_mbps: number
  } | null
}

export default async function AdminPelangganPage() {
  const admin = createAdminClient()

  const { data } = await admin
    .from('pelanggan')
    .select(`
      *,
      paket_internet (
        nama_paket,
        kecepatan_mbps
      )
    `)
    .order('created_at', { ascending: false })

  const pelanggan = (data ?? []) as Pelanggan[]

  return (
    <div className="rounded-2xl bg-white p-8 shadow-card">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-gray-900">
          Kelola Pelanggan
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Daftar dan aksi pelanggan.
        </p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
            <th className="pb-3">Nama</th>
            <th className="pb-3">Kontak</th>
            <th className="pb-3">Paket</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {pelanggan.map((p) => (
            <tr key={p.id} className="border-b border-gray-50">
              <td className="py-4 font-medium text-gray-700">
                {p.nama_lengkap}
              </td>

              <td className="py-4 text-gray-500">
                <div>{p.email}</div>
                <div className="text-xs">{p.no_hp}</div>
              </td>

              <td className="py-4 text-gray-500">
                {p.paket_internet
                  ? `${p.paket_internet.kecepatan_mbps} Mbps`
                  : '-'}
              </td>

              <td className="py-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    p.status_langganan === 'aktif'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {p.status_langganan}
                </span>
              </td>

              <td className="py-4">
                {p.status_langganan === 'aktif' ? (
                  <form action={deactivatePelanggan.bind(null, p.id)}>
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Nonaktifkan
                    </button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}

          {pelanggan.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="py-8 text-center text-gray-400"
              >
                Tidak ada pelanggan
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}