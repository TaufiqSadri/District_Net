import { updateProfilPelanggan } from '@/app/dashboard/actions'
import { getDashboardPelangganData } from '@/lib/data/dashboardPelanggan'

export default async function ProfilPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string }
}) {
  const { pelanggan } = await getDashboardPelangganData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Profil Akun</h1>
        <p className="mt-1 text-sm text-gray-500">Perbarui informasi kontak dan alamat pemasangan Anda.</p>
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

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-gray-900">Informasi Akun</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Nama Lengkap</p>
              <p className="mt-1 font-medium text-gray-800">{pelanggan.nama_lengkap}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Email</p>
              <p className="mt-1 font-medium text-gray-800">{pelanggan.email}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Status Langganan</p>
              <p className="mt-1 font-medium capitalize text-gray-800">{pelanggan.status_langganan}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Tanggal Bergabung</p>
              <p className="mt-1 font-medium text-gray-800">
                {new Date(pelanggan.tanggal_bergabung).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-gray-900">Perbarui Data Kontak</h2>
          <p className="mt-1 text-sm text-gray-500">Field nama dan email mengikuti data akun yang sudah terdaftar.</p>

          <form action={updateProfilPelanggan} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">No. HP</label>
              <input
                name="no_hp"
                type="tel"
                defaultValue={pelanggan.no_hp}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Alamat Pemasangan</label>
              <textarea
                name="alamat_pemasangan"
                defaultValue={pelanggan.alamat_pemasangan}
                rows={4}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  defaultValue={pelanggan.latitude ?? ''}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  defaultValue={pelanggan.longitude ?? ''}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-brand-pink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-pink-dark"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
