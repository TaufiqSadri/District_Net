'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import { SectionHeader } from '@/components/admin/landing/LandingShared'
import { createFaq, deleteFaq, updateFaq } from '@/app/admin/landing/actions'
import type { Faq } from '@/types/database'
import {
  EditButton,
  landingInputClass,
  Modal,
  SubmitBtn,
} from '@/components/admin/landing/managers/LandingManagerShared'

export default function FAQManager({ faqs }: { faqs: Faq[] }) {
  const [modal, setModal] = useState<'create' | Faq | null>(null)
  const [confirm, setConfirm] = useState<{ id: string; itemName: string } | null>(null)
  const [pending, start] = useTransition()

  function handleCreate(fd: FormData) {
    start(async () => { await createFaq(fd); setModal(null) })
  }
  function handleUpdate(id: string, fd: FormData) {
    start(async () => { await updateFaq(id, fd); setModal(null) })
  }
  function handleDelete() {
    if (!confirm) return
    start(async () => {
      await deleteFaq(confirm.id)
      setConfirm(null)
    })
  }

  return (
    <>
      <SectionHeader
        summary={`${faqs.length} Pertanyaan`}
        buttonLabel="Tambah Pertanyaan"
        onAdd={() => setModal('create')}
      />

      <div className="mt-6 space-y-5">
        {faqs.map((f, i) => (
          <div key={f.id} className="rounded-[18px] border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-[26px] font-bold text-[#5b2fd6]">
                #{i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[20px] font-bold leading-7 text-slate-900">{f.question}</h3>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">{f.answer}</p>
                <div className="mt-7 flex flex-wrap gap-4">
                  <EditButton onClick={() => setModal(f)} />
                  <button
                    type="button"
                    onClick={() => setConfirm({ id: f.id, itemName: f.question })}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-[16px] font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal === 'create' && (
        <Modal title="Tambah FAQ" onClose={() => setModal(null)}>
          <form action={handleCreate} className="space-y-4">
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Pertanyaan</label>
              <input name="question" required className={landingInputClass} placeholder="Berapa lama proses pemasangan?" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Jawaban</label>
              <textarea name="answer" required rows={4} className={landingInputClass} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Urutan</label>
              <input name="urutan" type="number" defaultValue={faqs.length + 1} className={landingInputClass} /></div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Batal</button>
              <SubmitBtn label="Simpan" pending={pending} />
            </div>
          </form>
        </Modal>
      )}

      {modal && modal !== 'create' && (
        <Modal title="Edit FAQ" onClose={() => setModal(null)}>
          <form action={(fd) => handleUpdate((modal as Faq).id, fd)} className="space-y-4">
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Pertanyaan</label>
              <input name="question" required defaultValue={(modal as Faq).question} className={landingInputClass} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Jawaban</label>
              <textarea name="answer" required rows={4} defaultValue={(modal as Faq).answer} className={landingInputClass} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Urutan</label>
              <input name="urutan" type="number" defaultValue={(modal as Faq).urutan} className={landingInputClass} /></div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Batal</button>
              <SubmitBtn label="Simpan" pending={pending} />
            </div>
          </form>
        </Modal>
      )}
      <ConfirmDialog
        open={!!confirm}
        title="Konfirmasi FAQ"
        itemName={confirm?.itemName ?? ''}
        message="FAQ ini akan dihapus permanen."
        confirmLabel="Ya, Hapus"
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
