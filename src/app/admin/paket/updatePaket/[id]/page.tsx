import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
      
import { updatePaket } from '@/app/admin/actions'
import { createAdminClient } from '@/lib/supabase/admin'

type Props = {
params: {
      id: string
      }
}

export default async function UpdatePaketPage({
      params,
      }: Props) {
      const admin = createAdminClient()

      const { data } = await admin
      .from('paket_internet')
      .select('*')
      .eq('id', params.id)
      .single()

      if (!data) {
      throw new Error('Paket tidak ditemukan')
      }

      return (
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4 md:p-8 shadow-card">

            <Link
            href="/admin/paket"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600"
            >
            <ArrowLeft size={16} />
            Kembali
            </Link>

            <div className="mb-8">

            <h1 className="font-display text-xl font-bold text-gray-900">
            Edit Paket
            </h1>

            <p className="mt-2 text-sm text-gray-500">
            Ubah detail paket internet.
            </p>

            </div>

            <form
            action={updatePaket.bind(
            null,
            params.id
            )}
            className="space-y-6"
            >

            <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nama Paket
            </label>

            <input
                  name="nama_paket"
                  defaultValue={data.nama_paket}
                  required
                  className="w-full rounded-xl border px-4 py-3"
            />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                  Kecepatan (Mbps)
                  </label>

                  <input
                  type="number"
                  name="kecepatan_mbps"
                  defaultValue={data.kecepatan_mbps}
                  required
                  className="w-full rounded-xl border px-4 py-3"
                  />
            </div>

            <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                  Harga
                  </label>

                  <input
                  type="number"
                  name="harga"
                  defaultValue={data.harga}
                  required
                  className="w-full rounded-xl border px-4 py-3"
                  />
            </div>

            </div>

            <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                  Deskripsi
            </label>

            <textarea
                  name="deskripsi"
                  rows={4}
                  defaultValue={data.deskripsi ?? ''}
                  className="w-full rounded-xl border px-4 py-3"
            />
            </div>

            <div className="flex flex-col gap-3 md:flex-row">

            <button
                  type="submit"
                  className="rounded-xl bg-brand-pink px-5 py-3 text-sm font-semibold text-white"
            >
                  Save
            </button>

            <Link
                  href="/admin/paket"
                  className="rounded-xl border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-700"
            >
                  Discard Changes
            </Link>

            </div>

            </form>

      </div>
      )
}
