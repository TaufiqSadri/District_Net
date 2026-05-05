'use client'

import { addPelangganByAdmin } from '@/app/admin/actions'
import { ArrowLeft, ChevronDown, Loader2, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Paket = {
  id: string
  nama_paket: string
  kecepatan_mbps: number
  harga: number
}

export default function TambahPelangganPage() {
  const [paketList, setPaketList] = useState<Paket[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/admin/paket')
      .then((r) => r.json())
      .then((d) => setPaketList(d ?? []))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const result = await addPelangganByAdmin(fd)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-10 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <User size={28} className="text-green-600" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-900">Pelanggan Berhasil Ditambahkan!</h2>
        <p className="mt-2 text-sm text-gray-500">Data pelanggan baru sudah tersimpan dengan status aktif.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/admin/pelanggan"
            className="rounded-xl bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-900"
          >
            Kembali ke Daftar
          </Link>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Tambah Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/pelanggan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card md:p-8">
        <div className="mb-8">
          <h1 className="font-display text-xl font-bold text-gray-900">Tambah Pelanggan Baru</h1>
          <p className="mt-1 text-sm text-gray-500">
            Isi data lengkap pelanggan. Akun akan langsung aktif tanpa perlu persetujuan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama + Status */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                name="nama_lengkap"
                required
                placeholder="Nama sesuai KTP"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Status Langganan</label>
              <div className="relative">
                <select
                  name="status_langganan"
                  defaultValue="aktif"
                  className="h-[50px] w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                >
                  <option value="aktif">Aktif</option>
                  <option value="pending">Pending</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Email + No HP */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">No. HP</label>
              <input
                name="no_hp"
                type="tel"
                required
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 karakter"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <input
                name="confirm_password"
                type="password"
                required
                minLength={8}
                placeholder="Ulangi password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
          </div>

          {/* Paket */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Paket Internet</label>
            <div className="relative">
              <select
                name="paket_id"
                required
                defaultValue=""
                className="h-[50px] w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              >
                <option value="" disabled>Pilih Paket</option>
                {paketList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_paket} — {p.kecepatan_mbps} Mbps (Rp {p.harga.toLocaleString('id-ID')}/bln)
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Alamat Pemasangan</label>
            <textarea
              name="alamat_pemasangan"
              required
              rows={3}
              placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
            />
          </div>

          {/* Koordinat (optional) */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Latitude <span className="text-gray-400">(opsional)</span>
              </label>
              <input
                name="latitude"
                type="number"
                step="any"
                placeholder="-0.9493"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Longitude <span className="text-gray-400">(opsional)</span>
              </label>
              <input
                name="longitude"
                type="number"
                step="any"
                placeholder="100.4172"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
          </div>

          {/* Tanggal bergabung */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tanggal Bergabung <span className="text-gray-400">(kosongkan = hari ini)</span>
            </label>
            <input
              name="tanggal_bergabung"
              type="date"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-pink px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              Simpan Pelanggan
            </button>
            <Link
              href="/admin/pelanggan"
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