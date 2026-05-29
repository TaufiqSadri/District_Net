'use client'

import { useRef, useState, useTransition } from 'react'
import { MapPin, Pencil, Search, Trash2, X } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import { SectionHeader } from '@/components/admin/landing/LandingShared'
import { createAreaLayanan, deleteAreaLayanan } from '@/app/admin/landing/actions'
import type { AreaLayanan } from '@/types/database'
import {
  landingInputClass,
  SubmitBtn,
} from '@/components/admin/landing/managers/LandingManagerShared'

type ServiceAreaRow = AreaLayanan & { id: string }

export default function ServiceAreaManager({ areas }: { areas: ServiceAreaRow[] }) {
  const [showForm, setShowForm] = useState(false)
  const [createDefaults, setCreateDefaults] = useState<{ kecamatan: string; nagari: string }>({ kecamatan: '', nagari: '' })
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{ ids: string[]; itemName: string; message: string } | null>(null)
  const [pending, start] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const normalizedSearch = search.toLowerCase().trim()
  const filteredAreas = normalizedSearch
    ? areas.filter((area) =>
        `${area.kecamatan} ${area.nagari}`.toLowerCase().includes(normalizedSearch),
      )
    : areas

  const grouped = filteredAreas.reduce<Record<string, ServiceAreaRow[]>>((acc, a) => {
    if (!acc[a.kecamatan]) acc[a.kecamatan] = []
    acc[a.kecamatan].push(a)
    return acc
  }, {})

  function handleCreate(fd: FormData) {
    start(async () => {
      await createAreaLayanan(fd)
      setShowForm(false)
      setCreateDefaults({ kecamatan: '', nagari: '' })
    })
  }

  function handleDelete() {
    if (!confirm) return
    start(async () => {
      for (const id of confirm.ids) {
        await deleteAreaLayanan(id)
      }
      setConfirm(null)
    })
  }

  function openCreate(kecamatan = '') {
    setCreateDefaults({ kecamatan, nagari: '' })
    setShowForm(true)
  }

  const totalKecamatan = new Set(areas.map((area) => area.kecamatan)).size

  return (
    <>
      <SectionHeader
        summary={`${areas.length} Nagari dari ${totalKecamatan} Kecamatan`}
        buttonLabel="Tambah Area"
        onAdd={() => openCreate()}
      />

      <div className="relative mt-5">
        <Search
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari kecamatan atau nagari..."
          className="h-12 w-full rounded-xl border border-slate-700 bg-white pl-12 pr-10 text-[15px] outline-none transition placeholder:text-slate-500 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Hapus pencarian area"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {showForm && (
        <form ref={formRef} action={handleCreate} className="mt-5 rounded-[18px] border border-dashed border-brand-purple bg-violet-50 p-5">
          <p className="mb-3 text-sm font-semibold text-gray-700">Tambah Nagari Baru</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Kecamatan</label>
              <input name="kecamatan" required defaultValue={createDefaults.kecamatan} className={landingInputClass} placeholder="Batang Anai" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Nagari / Kelurahan</label>
              <input name="nagari" required defaultValue={createDefaults.nagari} className={landingInputClass} placeholder="Lubuk Alung" /></div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setCreateDefaults({ kecamatan: '', nagari: '' })
              }}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
            >
              Batal
            </button>
            <SubmitBtn label="Tambah" pending={pending} />
          </div>
        </form>
      )}

      <div className="mt-6 space-y-6">
        {Object.entries(grouped).length > 0 ? Object.entries(grouped).map(([kec, nagariList]) => (
          <div key={kec} className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] bg-[#eef2ff] px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-brand-purple">
                  <MapPin size={15} />
                </span>
                <p className="truncate text-[20px] font-bold text-[#4f2cff]">Kec. {kec}</p>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <button type="button" onClick={() => openCreate(kec)} className="transition hover:text-brand-purple" aria-label={`Tambah nagari di ${kec}`}>
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm({
                    ids: nagariList.map((area) => area.id),
                    itemName: `Kec. ${kec}`,
                    message: 'Semua nagari pada kecamatan ini akan dihapus dari daftar jangkauan.',
                  })}
                  className="transition hover:text-red-600"
                  aria-label={`Hapus kecamatan ${kec}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 px-6 py-6">
              {nagariList.map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-[16px] font-medium text-slate-600">
                  {a.nagari}
                  <button
                    type="button"
                    onClick={() => setConfirm({
                      ids: [a.id],
                      itemName: `${a.nagari} - Kec. ${a.kecamatan}`,
                      message: 'Area layanan ini akan dihapus permanen dari daftar jangkauan.',
                    })}
                    className="rounded-full p-0.5 text-slate-500 hover:bg-red-100 hover:text-red-600"
                    title="Hapus"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => openCreate(kec)}
                className="rounded-xl border border-dashed border-violet-300 px-4 py-2 text-[16px] font-medium text-[#5b2fd6] transition hover:bg-violet-50"
              >
                + Tambah Nagari
              </button>
            </div>
          </div>
        )) : (
          <div className="rounded-[18px] border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
            Area layanan tidak ditemukan.
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!confirm}
        title="Konfirmasi Area Layanan"
        itemName={confirm?.itemName ?? ''}
        message={confirm?.message}
        confirmLabel="Ya, Hapus"
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
