import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { updateTagihanAction } from '@/app/admin/actions'
import { getTagihanById } from '@/lib/data/tagihan'

export default async function EditTagihanPage({ params }: { params: { id: string } }) {
  const tagihan = await getTagihanById(params.id)
  if (!tagihan) notFound()

  const action = updateTagihanAction.bind(null, tagihan.id)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/tagihan/${tagihan.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Kembali ke Detail
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card md:p-8">
        <div className="mb-8">
          <h1 className="font-display text-xl font-bold text-gray-900">Edit Tagihan</h1>
          <p className="mt-1 text-sm text-gray-500">Perbarui nominal, status, dan tanggal jatuh tempo tagihan.</p>
        </div>

        <form action={action} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Jumlah Tagihan</label>
            <input
              name="jumlah_tagihan"
              type="number"
              min={0}
              defaultValue={tagihan.jumlah_tagihan}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Status Tagihan</label>
              <select
                name="status_tagihan"
                defaultValue={tagihan.status_tagihan === 'overdue' ? 'belum_bayar' : tagihan.status_tagihan}
                className="h-[50px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              >
                <option value="belum_bayar">Belum Bayar</option>
                <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                <option value="lunas">Lunas</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Jatuh Tempo</label>
              <input
                name="jatuh_tempo"
                type="date"
                defaultValue={tagihan.jatuh_tempo}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              className="rounded-xl bg-brand-pink px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
            >
              Simpan Perubahan
            </button>
            <Link
              href={`/admin/tagihan/${tagihan.id}`}
              className="rounded-xl border border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
