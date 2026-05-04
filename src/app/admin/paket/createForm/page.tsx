import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { addPaket } from '@/app/admin/actions'

export default function CreatePaketPage() {
      return (
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4 md:p-8 shadow-card">

            <Link
            href="/admin/paket"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
            <ArrowLeft size={16} />
            Kembali
            </Link>

            <div className="mb-8">
            <h1 className="font-display text-xl font-bold text-gray-900">
            Create Paket Baru
            </h1>

            <p className="mt-2 text-sm text-gray-500">
            Tambahkan paket internet baru untuk pelanggan.
            </p>
            </div>

            <form
            action={addPaket}
            className="space-y-6"
            >

            <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                  Gambar Paket
            </label>

            <input
                  type="file"
                  name="gambar"
                  accept="image/*"
                  className="w-full rounded-xl border px-4 py-3"
            />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nama Paket
                  </label>

                  <input
                  name="nama_paket"
                  required
                  className="w-full rounded-xl border px-4 py-3"
                  />
            </div>

            <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                  Kecepatan (Mbps)
                  </label>

                  <input
                  type="number"
                  name="kecepatan_mbps"
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
                  className="w-full rounded-xl border px-4 py-3"
            />
            </div>

            <div className="flex flex-col gap-3 md:flex-row">

                  <button
                  type="submit"
                  className="rounded-xl bg-brand-pink px-5 py-3 text-sm font-semibold text-white hover:bg-pink-900"
                  >
                  Save Paket
                  </button>

                  <button
                  type="submit"
                  name="create_another"
                  value="true"
                  className="rounded-xl bg-brand-purple px-5 py-3 text-sm font-semibold text-white hover:bg-purple-900"
                  >
                  Save & Create Another
                  </button>

                  <Link
                  href="/admin/paket"
                  className="rounded-xl border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-slate-300"
                  >
                  Discard Changes
                  </Link>

            </div>

            </form>
      </div>
      )
}