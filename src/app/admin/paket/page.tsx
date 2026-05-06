import Link from 'next/link'
import { togglePaketStatus, deletePaket } from '@/app/admin/actions'

import { createAdminClient } from '@/lib/supabase/admin'

type Paket = {
  id: string
  nama_paket: string
  kecepatan_mbps: number
  harga: number
  deskripsi: string | null
  is_active: boolean
  image_url: string | null
}

export default async function AdminPaketPage() {
  const admin = createAdminClient()

  const { data } = await admin
    .from('paket_internet')
    .select('*')
    .order('harga')

  const paketList = (data ?? []) as Paket[]

  const rupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  return (
    <div>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">
              Kelola Paket
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Paket internet yang tampil di landing page.
            </p>
          </div>

          <Link
            href="/admin/paket/createPaket"
            className="rounded-xl bg-brand-pink px-4 py-2 text-sm font-semibold text-white hover:bg-pink-900"
          >
            + Tambah Paket
          </Link>

        </div>


      <br />

      {paketList.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-card">
          Belum ada paket internet
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {paketList.map((paket) => (
          <div
            key={paket.id}
            className="overflow-hidden rounded-2xl bg-white shadow-card"
          >

            <div className="aspect-video bg-gray-100">
              {paket.image_url ? (
                <img
                  src={paket.image_url}
                  alt={paket.nama_paket}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400 border ">
                  No Image
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900">
                    {paket.nama_paket}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {paket.kecepatan_mbps} Mbps
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    paket.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {paket.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <p className="mb-4 text-2xl font-bold text-brand-purple">
                {rupiah(paket.harga)}
              </p>

              <p className="mb-6 text-sm text-gray-500">
                {paket.deskripsi}
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/paket/updatePaket/${paket.id}`}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-slate-300"
                >
                  Edit
                </Link>

                <form
                  action={togglePaketStatus.bind(
                    null,
                    paket.id,
                    paket.is_active
                  )}
                >
                  <button
                    type="submit"
                    className="rounded-lg border border-yellow-200 px-3 py-2 text-xs font-medium text-yellow-700 hover:bg-red-300"
                  >
                    {paket.is_active
                      ? 'Nonaktifkan'
                      : 'Aktifkan'}
                  </button>
                </form>

                <form
                  action={deletePaket.bind(
                    null,
                    paket.id
                  )}
                >
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-slate-300"
                  >
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}