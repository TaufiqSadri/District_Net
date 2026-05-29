'use client'

import { useState, useTransition } from 'react'
import { Check, Gauge, Rocket, Zap } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  ActionButtonGroup,
  EmptyCreateCard,
  SectionHeader,
  StatusBadge,
} from '@/components/admin/landing/LandingShared'
import {
  addPaket,
  deletePaket,
  togglePaketStatus,
  updatePaket,
} from '@/app/admin/landing/actions'
import type { PaketInternet } from '@/types/database'
import {
  type ConfirmState,
  DeleteButton,
  EditButton,
  getPackageFeatures,
  getPackageLabel,
  landingInputClass,
  Modal,
  PaketImageUploader,
  SubmitBtn,
  ToggleButton,
} from '@/components/admin/landing/managers/LandingManagerShared'

export default function PackageManager({ paketList }: { paketList: PaketInternet[] }) {
  const [modal, setModal] = useState<'create' | PaketInternet | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [pending, start] = useTransition()
  const [createImageUrl, setCreateImageUrl] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')

  const rupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  function openCreate() {
    setCreateImageUrl('')
    setModal('create')
  }

  function openEdit(p: PaketInternet) {
    setEditImageUrl(p.image_url ?? '')
    setModal(p)
  }

  function handleCreate(fd: FormData) {
    fd.set('image_url', createImageUrl)
    start(async () => {
      await addPaket(fd)
      setModal(null)
      setCreateImageUrl('')
    })
  }

  function handleUpdate(id: string, fd: FormData) {
    fd.set('image_url', editImageUrl)
    start(async () => {
      await updatePaket(id, fd)
      setModal(null)
    })
  }

  function handleToggle(p: PaketInternet) {
    if (!p.is_active) {
      start(async () => {
        await togglePaketStatus(p.id, p.is_active, new FormData())
      })
      return
    }

    setConfirm({
      itemName: p.nama_paket,
      message: 'Paket ini akan dinonaktifkan dan tidak tampil sebagai pilihan aktif.',
      confirmLabel: 'Ya, Nonaktifkan',
      onConfirm: () => {
        start(async () => {
          await togglePaketStatus(p.id, p.is_active, new FormData())
          setConfirm(null)
        })
      },
    })
  }

  function handleDelete(p: PaketInternet) {
    setConfirm({
      itemName: p.nama_paket,
      message: 'Paket ini akan dihapus permanen dari daftar paket internet.',
      confirmLabel: 'Ya, Hapus',
      onConfirm: () => {
        start(async () => {
          await deletePaket(p.id, new FormData())
          setConfirm(null)
        })
      },
    })
  }

  const activeCount = paketList.filter((p) => p.is_active).length

  return (
    <>
      <SectionHeader
        summary={`${paketList.length} Paket`}
        activeText={`${activeCount} aktif`}
        buttonLabel="Tambah Paket"
        onAdd={openCreate}
      />

      {paketList.length === 0 ? (
        <div className="mt-6">
          <EmptyCreateCard
            title="Buat Paket Baru"
            description="Tambahkan paket internet yang akan tampil pada halaman package landing page."
            onClick={openCreate}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {paketList.map((p, index) => {
            const label = getPackageLabel(p, index)
            const VisualIcon = label === 'MOST POPULAR' ? Zap : label === 'ENTERPRISE' ? Rocket : Gauge
            const features = getPackageFeatures(p)

            return (
              <div
                key={p.id}
                className={`overflow-hidden rounded-[18px] border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${
                  label === 'MOST POPULAR' ? 'border-violet-300 ring-1 ring-violet-200' : 'border-[#e5e7eb]'
                }`}
              >
                <div className="relative flex h-40 items-center justify-center bg-[#b9b4b3]">
                  <span className="absolute left-5 top-4 rounded-full border border-white/70 bg-white/25 px-3 py-1 text-[11px] font-bold uppercase text-white">
                    {label}
                  </span>
                  <VisualIcon size={76} className="text-white/25" />
                </div>

                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[27px] font-bold leading-tight text-slate-900">{p.nama_paket}</h3>
                      <p className="mt-1 text-[18px] font-bold text-[#4f2cff]">{p.kecepatan_mbps} Mbps</p>
                    </div>
                    <StatusBadge active={p.is_active} />
                  </div>

                  <p className="text-[28px] font-bold leading-tight text-slate-900">
                    {rupiah(p.harga)}<span className="text-sm font-normal text-slate-500">/bln</span>
                  </p>

                  <ul className="mt-6 space-y-4 text-[15px] leading-6 text-slate-600">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check size={17} className="mt-0.5 flex-shrink-0 rounded-full border border-[#4f2cff] p-[2px] text-[#4f2cff]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="my-6 border-t border-[#e5e7eb]" />

                  <ActionButtonGroup>
                    <EditButton onClick={() => openEdit(p)} />
                    <ToggleButton active={p.is_active} onClick={() => handleToggle(p)} compact />
                    <DeleteButton onClick={() => handleDelete(p)} iconOnly label="Hapus paket" />
                  </ActionButtonGroup>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal === 'create' && (
        <Modal title="Tambah Paket Baru" onClose={() => setModal(null)}>
          <div className="max-h-[80vh] overflow-y-auto pr-1">
            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Gambar Paket <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <PaketImageUploader onUploaded={(url) => setCreateImageUrl(url)} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Nama Paket</label>
                <input name="nama_paket" required className={landingInputClass} placeholder="Paket Basic" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Kecepatan (Mbps)</label>
                  <input name="kecepatan_mbps" type="number" required className={landingInputClass} placeholder="10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Harga (Rp)</label>
                  <input name="harga" type="number" required className={landingInputClass} placeholder="150000" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi</label>
                <textarea name="deskripsi" rows={3} className={landingInputClass} placeholder="Cocok untuk penggunaan sehari-hari..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
                  Batal
                </button>
                <SubmitBtn label="Simpan Paket" pending={pending} />
              </div>
            </form>
          </div>
        </Modal>
      )}

      {modal && modal !== 'create' && (
        <Modal title="Edit Paket" onClose={() => setModal(null)}>
          <div className="max-h-[80vh] overflow-y-auto pr-1">
            <form action={(fd) => handleUpdate((modal as PaketInternet).id, fd)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Gambar Paket <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <PaketImageUploader
                  defaultUrl={(modal as PaketInternet).image_url ?? undefined}
                  onUploaded={(url) => setEditImageUrl(url)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Nama Paket</label>
                <input name="nama_paket" required defaultValue={(modal as PaketInternet).nama_paket} className={landingInputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Kecepatan (Mbps)</label>
                  <input name="kecepatan_mbps" type="number" required defaultValue={(modal as PaketInternet).kecepatan_mbps} className={landingInputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Harga (Rp)</label>
                  <input name="harga" type="number" required defaultValue={(modal as PaketInternet).harga} className={landingInputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi</label>
                <textarea name="deskripsi" rows={3} defaultValue={(modal as PaketInternet).deskripsi ?? ''} className={landingInputClass} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
                  Batal
                </button>
                <SubmitBtn label="Simpan Perubahan" pending={pending} />
              </div>
            </form>
          </div>
        </Modal>
      )}
      <ConfirmDialog
        open={!!confirm}
        title="Konfirmasi Paket"
        itemName={confirm?.itemName ?? ''}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm?.onConfirm()}
      />
    </>
  )
}
