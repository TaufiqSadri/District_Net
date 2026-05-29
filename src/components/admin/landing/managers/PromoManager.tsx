'use client'

import { useRef, useState, useTransition } from 'react'
import { MoreVertical } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  ActionButtonGroup,
  EmptyCreateCard,
  SectionHeader,
  StatusBadge,
} from '@/components/admin/landing/LandingShared'
import {
  createPromo,
  deletePromo,
  togglePromoStatus,
  updatePromo,
} from '@/app/admin/landing/actions'
import type { Promo } from '@/types/database'
import {
  type ConfirmState,
  DeleteButton,
  EditButton,
  landingInputClass,
  Modal,
  SubmitBtn,
  ToggleButton,
} from '@/components/admin/landing/managers/LandingManagerShared'

export default function PromoManager({ promos }: { promos: Promo[] }) {
  const [modal, setModal] = useState<'create' | Promo | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [pending, start] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleCreate(fd: FormData) {
    start(async () => { await createPromo(fd); setModal(null) })
  }
  function handleUpdate(id: string, fd: FormData) {
    start(async () => { await updatePromo(id, fd); setModal(null) })
  }

  function handleToggle(p: Promo) {
    if (!p.is_active) {
      start(async () => {
        await togglePromoStatus(p.id, p.is_active)
      })
      return
    }

    setConfirm({
      itemName: p.title,
      message: 'Promo ini akan dinonaktifkan dan tidak tampil di halaman promo.',
      confirmLabel: 'Ya, Nonaktifkan',
      onConfirm: () => {
        start(async () => {
          await togglePromoStatus(p.id, p.is_active)
          setConfirm(null)
        })
      },
    })
  }

  function handleDelete(p: Promo) {
    setConfirm({
      itemName: p.title,
      message: 'Promo ini akan dihapus permanen.',
      confirmLabel: 'Ya, Hapus',
      onConfirm: () => {
        start(async () => {
          await deletePromo(p.id)
          setConfirm(null)
        })
      },
    })
  }

  const activeCount = promos.filter((p) => p.is_active).length

  return (
    <>
      <SectionHeader
        summary={`${promos.length} Promo`}
        activeText={`${activeCount} aktif`}
        buttonLabel="Tambah Promo"
        onAdd={() => setModal('create')}
      />

      <div className="mt-6 grid gap-7 lg:grid-cols-2">
        {promos.map((p) => (
          <div key={p.id} className="rounded-[18px] border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase text-[#5b2fd6]">
                  {p.tag}
                </span>
                <StatusBadge active={p.is_active} />
              </div>
              <MoreVertical size={20} className="text-slate-500" />
            </div>
            <h3 className="text-[18px] font-semibold text-slate-900">{p.title}</h3>
            <p className="mt-3 min-h-[84px] text-[17px] leading-7 text-slate-500">{p.description}</p>
            <div className="my-6 border-t border-[#e5e7eb]" />
            <ActionButtonGroup>
              <EditButton onClick={() => setModal(p)} />
              <ToggleButton active={p.is_active} onClick={() => handleToggle(p)} />
              <DeleteButton onClick={() => handleDelete(p)} />
            </ActionButtonGroup>
          </div>
        ))}
        <EmptyCreateCard
          title="Buat Promo Baru"
          description="Tambahkan penawaran menarik untuk menarik lebih banyak pelanggan"
          onClick={() => setModal('create')}
        />
      </div>

      {modal === 'create' && (
        <Modal title="Tambah Promo" onClose={() => setModal(null)}>
          <form ref={formRef} action={handleCreate} className="space-y-4">
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Judul</label>
              <input name="title" required className={landingInputClass} placeholder="Gratis Biaya Instalasi" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi</label>
              <textarea name="description" required rows={3} className={landingInputClass} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs font-semibold text-gray-600">Tag</label>
                <input name="tag" required className={landingInputClass} placeholder="Pelanggan Baru" /></div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-600">Urutan</label>
                <input name="urutan" type="number" defaultValue={promos.length + 1} className={landingInputClass} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Batal</button>
              <SubmitBtn label="Simpan" pending={pending} />
            </div>
          </form>
        </Modal>
      )}

      {modal && modal !== 'create' && (
        <Modal title="Edit Promo" onClose={() => setModal(null)}>
          <form action={(fd) => handleUpdate((modal as Promo).id, fd)} className="space-y-4">
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Judul</label>
              <input name="title" required defaultValue={(modal as Promo).title} className={landingInputClass} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi</label>
              <textarea name="description" required rows={3} defaultValue={(modal as Promo).description} className={landingInputClass} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs font-semibold text-gray-600">Tag</label>
                <input name="tag" required defaultValue={(modal as Promo).tag} className={landingInputClass} /></div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-600">Urutan</label>
                <input name="urutan" type="number" defaultValue={(modal as Promo).urutan} className={landingInputClass} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Batal</button>
              <SubmitBtn label="Simpan" pending={pending} />
            </div>
          </form>
        </Modal>
      )}
      <ConfirmDialog
        open={!!confirm}
        title="Konfirmasi Promo"
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
