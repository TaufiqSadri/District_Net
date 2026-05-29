'use client'

import { useState, useTransition } from 'react'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  ActionButtonGroup,
  EmptyCreateCard,
  SectionHeader,
  StatusBadge,
} from '@/app/admin/landing/sections/LandingShared'
import {
  createIklan,
  deleteIklan,
  toggleIklanStatus,
  updateIklan,
} from '@/app/admin/landing/actions'
import type { Iklan } from '@/types/database'
import {
  type ConfirmState,
  DeleteButton,
  EditButton,
  IklanImageUploader,
  landingInputClass,
  Modal,
  SubmitBtn,
  ToggleButton,
} from '@/app/admin/landing/sections/managers/LandingManagerShared'

export default function BannerManager({ iklans }: { iklans: Iklan[] }) {
  const [modal, setModal] = useState<'create' | Iklan | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [pending, start] = useTransition()
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [editUploadedUrl, setEditUploadedUrl] = useState('')
  const [formError, setFormError] = useState('')

  function openCreate() {
    setUploadedUrl('')
    setFormError('')
    setModal('create')
  }

  function openEdit(iklan: Iklan) {
    setEditUploadedUrl(iklan.image_url)
    setFormError('')
    setModal(iklan)
  }

  async function handleCreate(fd: FormData) {
    const url = uploadedUrl || (fd.get('image_url_manual') as string)
    if (!url) {
      setFormError('Upload gambar atau isi URL gambar terlebih dahulu.')
      return
    }
    fd.set('image_url', url)
    start(async () => {
      const result = await createIklan(fd)
      if (result?.error) {
        setFormError(result.error)
        return
      }
      setModal(null)
    })
  }

  async function handleUpdate(id: string, fd: FormData) {
    const url = editUploadedUrl || (fd.get('image_url_manual') as string)
    if (!url) {
      setFormError('Upload gambar atau isi URL gambar terlebih dahulu.')
      return
    }
    fd.set('image_url', url)
    start(async () => {
      const result = await updateIklan(id, fd)
      if (result?.error) {
        setFormError(result.error)
        return
      }
      setModal(null)
    })
  }

  function handleToggle(iklan: Iklan) {
    if (!iklan.is_active) {
      start(async () => {
        await toggleIklanStatus(iklan.id, iklan.is_active)
      })
      return
    }

    setConfirm({
      itemName: iklan.judul,
      message: 'Banner ini akan dinonaktifkan dan tidak tampil di slider halaman utama.',
      confirmLabel: 'Ya, Nonaktifkan',
      onConfirm: () => {
        start(async () => {
          await toggleIklanStatus(iklan.id, iklan.is_active)
          setConfirm(null)
        })
      },
    })
  }

  function handleDelete(iklan: Iklan) {
    setConfirm({
      itemName: iklan.judul,
      message: 'Banner ini akan dihapus permanen dari daftar iklan.',
      confirmLabel: 'Ya, Hapus',
      onConfirm: () => {
        start(async () => {
          await deleteIklan(iklan.id, iklan.image_url)
          setConfirm(null)
        })
      },
    })
  }

  const activeCount = iklans.filter((i) => i.is_active).length

  return (
    <>
      <SectionHeader
        summary={`${iklans.length} banner`}
        activeText={`${activeCount} aktif`}
        buttonLabel="Tambah Iklan"
        onAdd={openCreate}
      />

      {iklans.length === 0 ? (
        <div className="mt-6">
          <EmptyCreateCard
            title="Buat Iklan Baru"
            description="Tambah banner untuk ditampilkan sebagai slider di halaman utama website."
            onClick={openCreate}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {iklans.map((iklan) => (
            <div key={iklan.id} className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src={iklan.image_url}
                  alt={iklan.judul}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <span className="absolute left-4 top-4 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
                  #{iklan.urutan}
                </span>
              </div>

              <div className="p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-bold text-slate-900">{iklan.judul || 'Gambar'}</h3>
                  <StatusBadge active={iklan.is_active} />
                </div>

                <ActionButtonGroup>
                  <EditButton onClick={() => openEdit(iklan)} />
                  <ToggleButton active={iklan.is_active} onClick={() => handleToggle(iklan)} compact />
                  <DeleteButton onClick={() => handleDelete(iklan)} iconOnly label="Hapus iklan" />
                </ActionButtonGroup>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'create' && (
        <Modal title="Tambah Iklan Banner" onClose={() => setModal(null)}>
          <div className="max-h-[80vh] overflow-y-auto">
            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Gambar Banner <span className="text-red-500">*</span>
                </label>
                <IklanImageUploader onUploaded={(url) => setUploadedUrl(url)} />
                <p className="mt-2 text-xs text-gray-400">Atau masukkan URL gambar langsung:</p>
                <input
                  name="image_url_manual"
                  type="url"
                  placeholder="https://..."
                  className={`${landingInputClass} mt-1`}
                  onChange={(e) => { if (!uploadedUrl) setUploadedUrl(e.target.value) }}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Judul Banner</label>
                <input name="judul" required className={landingInputClass} placeholder="Promo Akhir Tahun" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Deskripsi <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <textarea name="deskripsi" rows={2} className={landingInputClass} placeholder="Keterangan singkat iklan..." />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  URL Tujuan Klik <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <input name="link_url" type="url" className={landingInputClass} placeholder="https://..." />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Urutan Tampil</label>
                <input name="urutan" type="number" defaultValue={iklans.length + 1} className={landingInputClass} />
              </div>

              {formError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Batal</button>
                <SubmitBtn label="Simpan Iklan" pending={pending} />
              </div>
            </form>
          </div>
        </Modal>
      )}

      {modal && modal !== 'create' && (
        <Modal title="Edit Iklan Banner" onClose={() => setModal(null)}>
          <div className="max-h-[80vh] overflow-y-auto">
            <form action={(fd) => handleUpdate((modal as Iklan).id, fd)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Gambar Banner <span className="text-red-500">*</span>
                </label>
                <IklanImageUploader
                  defaultUrl={(modal as Iklan).image_url}
                  onUploaded={(url) => setEditUploadedUrl(url)}
                />
                <p className="mt-2 text-xs text-gray-400">Atau masukkan URL gambar langsung:</p>
                <input
                  name="image_url_manual"
                  type="url"
                  defaultValue={(modal as Iklan).image_url}
                  placeholder="https://..."
                  className={`${landingInputClass} mt-1`}
                  onChange={(e) => setEditUploadedUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Judul Banner</label>
                <input name="judul" required defaultValue={(modal as Iklan).judul} className={landingInputClass} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Deskripsi <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <textarea name="deskripsi" rows={2} defaultValue={(modal as Iklan).deskripsi ?? ''} className={landingInputClass} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  URL Tujuan Klik <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <input name="link_url" type="url" defaultValue={(modal as Iklan).link_url ?? ''} className={landingInputClass} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Urutan Tampil</label>
                <input name="urutan" type="number" defaultValue={(modal as Iklan).urutan} className={landingInputClass} />
              </div>

              {formError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Batal</button>
                <SubmitBtn label="Simpan Perubahan" pending={pending} />
              </div>
            </form>
          </div>
        </Modal>
      )}
      <ConfirmDialog
        open={!!confirm}
        title="Konfirmasi Banner"
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
