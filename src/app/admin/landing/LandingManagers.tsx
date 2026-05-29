'use client'

import { useRef, useState, useTransition } from 'react'
import {
  Ban,
  Check,
  CheckCircle2,
  Gauge,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  Rocket,
  Search,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import type { Promo, Faq, AreaLayanan, Iklan, PaketInternet } from '@/types/database'
import {
  ActionButtonGroup,
  EmptyCreateCard,
  SectionHeader,
  StatusBadge,
} from '@/components/admin/landing/LandingShared'
import {
  createPromo, updatePromo, deletePromo, togglePromoStatus,
  createFaq, updateFaq, deleteFaq,
  createAreaLayanan, deleteAreaLayanan,
  createIklan, updateIklan, deleteIklan, toggleIklanStatus,
} from './actions'
import { addPaket, updatePaket, deletePaket, togglePaketStatus } from '@/app/admin/landing/actions'
import { createClient } from '@/lib/supabase/client'

// ── Reusable modal ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SubmitBtn({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-pink px-5 text-sm font-semibold text-white transition hover:bg-pink-900 disabled:opacity-60">
      {pending && <Loader2 size={14} className="animate-spin" />}
      {label}
    </button>
  )
}

// ── Shared constants ───────────────────────────────────────────────────────────
const IKLAN_BUCKET = 'iklan-banners'
const PAKET_BUCKET = 'paket-images'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function EditButton({ onClick, label = 'Edit' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-5 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      <Pencil size={15} />
      {label}
    </button>
  )
}

function ToggleButton({
  active,
  onClick,
  compact = false,
}: {
  active: boolean
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-[15px] font-semibold text-amber-700 transition hover:bg-amber-100 ${
        compact ? 'px-4' : 'px-5'
      }`}
    >
      <Ban size={15} />
      {active ? 'Nonaktifkan' : 'Aktifkan'}
    </button>
  )
}

function DeleteButton({
  onClick,
  label = 'Hapus',
  iconOnly = false,
}: {
  onClick: () => void
  label?: string
  iconOnly?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-[15px] font-semibold text-red-700 transition hover:bg-red-100 ${
        iconOnly ? 'w-10 px-0' : 'px-5'
      }`}
      aria-label={label}
    >
      <Trash2 size={15} />
      {iconOnly ? null : label}
    </button>
  )
}

function getPackageLabel(paket: PaketInternet, index: number) {
  const name = paket.nama_paket.toLowerCase()
  if (name.includes('premium') || name.includes('enterprise') || index >= 2) return 'ENTERPRISE'
  if (name.includes('standar') || name.includes('popular') || index === 1) return 'MOST POPULAR'
  return 'ENTRY LEVEL'
}

function getPackageFeatures(paket: PaketInternet) {
  if (paket.benefits?.length > 0) return paket.benefits

  if (paket.kecepatan_mbps >= 100) {
    return [
      `Kecepatan tinggi ${paket.kecepatan_mbps} Mbps`,
      'Dukungan prioritas 24/7',
      'Bebas hambatan & Latency rendah',
    ]
  }

  if (paket.kecepatan_mbps >= 50) {
    return [
      `Kecepatan hingga ${paket.kecepatan_mbps} Mbps`,
      'Optimal untuk 8-12 perangkat',
      'Bisa digunakan oleh banyak user',
    ]
  }

  return [
    `Kecepatan hingga ${paket.kecepatan_mbps} Mbps`,
    'Ideal untuk 1-4 perangkat',
    'Kuota tidak terbatas',
  ]
}

// ── IKLAN IMAGE UPLOADER ───────────────────────────────────────────────────────
function IklanImageUploader({
  defaultUrl,
  onUploaded,
}: {
  defaultUrl?: string
  onUploaded: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(defaultUrl ?? '')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    if (!ALLOWED.includes(file.type)) {
      setUploadError('Format harus JPG, PNG, WEBP, atau GIF.')
      return
    }
    if (file.size > MAX_SIZE) {
      setUploadError('Ukuran maksimal 5 MB.')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, '-').toLowerCase()}`

    const { error } = await supabase.storage.from(IKLAN_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

    if (error) {
      setUploadError(error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(IKLAN_BUCKET).getPublicUrl(path)
    setPreviewUrl(data.publicUrl)
    onUploaded(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center transition hover:border-brand-purple/50 hover:bg-white">
        {uploading ? (
          <Loader2 size={22} className="animate-spin text-brand-purple" />
        ) : (
          <UploadCloud size={22} className="text-brand-purple" />
        )}
        <span className="text-xs font-semibold text-gray-600">
          {uploading ? 'Mengunggah...' : 'Klik untuk upload gambar'}
        </span>
        <span className="text-xs text-gray-400">JPG, PNG, WEBP, GIF · Maks 5 MB</span>
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>

      {uploadError ? (
        <p className="text-xs text-red-600">{uploadError}</p>
      ) : null}

      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-green-200 bg-green-50 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-green-700">
            <CheckCircle2 size={13} />
            Gambar siap
          </div>
          <div className="relative h-28 w-full overflow-hidden rounded-lg">
            <img src={previewUrl} alt="Preview banner" className="h-full w-full object-cover" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ── PAKET IMAGE UPLOADER ───────────────────────────────────────────────────────
function PaketImageUploader({
  defaultUrl,
  onUploaded,
}: {
  defaultUrl?: string
  onUploaded: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(defaultUrl ?? '')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    if (!ALLOWED.includes(file.type)) {
      setUploadError('Format harus JPG, PNG, WEBP, atau GIF.')
      return
    }
    if (file.size > MAX_SIZE) {
      setUploadError('Ukuran maksimal 5 MB.')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, '-').toLowerCase()}`

    const { error } = await supabase.storage.from(PAKET_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

    if (error) {
      setUploadError(error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(PAKET_BUCKET).getPublicUrl(path)
    setPreviewUrl(data.publicUrl)
    onUploaded(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center transition hover:border-brand-purple/50 hover:bg-white">
        {uploading ? (
          <Loader2 size={22} className="animate-spin text-brand-purple" />
        ) : (
          <UploadCloud size={22} className="text-brand-purple" />
        )}
        <span className="text-xs font-semibold text-gray-600">
          {uploading ? 'Mengunggah...' : 'Klik untuk upload gambar paket'}
        </span>
        <span className="text-xs text-gray-400">JPG, PNG, WEBP, GIF · Maks 5 MB</span>
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>

      {uploadError ? (
        <p className="text-xs text-red-600">{uploadError}</p>
      ) : null}

      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-green-200 bg-green-50 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-green-700">
            <CheckCircle2 size={13} />
            Gambar siap
          </div>
          <div className="relative h-28 w-full overflow-hidden rounded-lg bg-gray-100">
            <img src={previewUrl} alt="Preview gambar paket" className="h-full w-full object-cover" />
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400">Belum ada gambar — paket akan tampil tanpa gambar.</p>
      )}
    </div>
  )
}

// ── IKLAN MANAGER ──────────────────────────────────────────────────────────────
export function IklanManager({ iklans }: { iklans: Iklan[] }) {
  const [modal, setModal] = useState<'create' | Iklan | null>(null)
  const [confirm, setConfirm] = useState<{
    itemName: string
    message: string
    confirmLabel: string
    onConfirm: () => void
  } | null>(null)
  const [pending, start] = useTransition()
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [editUploadedUrl, setEditUploadedUrl] = useState('')
  const [formError, setFormError] = useState('')

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20'

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
    if (!url) { setFormError('Upload gambar atau isi URL gambar terlebih dahulu.'); return }
    fd.set('image_url', url)
    start(async () => {
      const result = await createIklan(fd)
      if (result?.error) { setFormError(result.error); return }
      setModal(null)
    })
  }

  async function handleUpdate(id: string, fd: FormData) {
    const url = editUploadedUrl || (fd.get('image_url_manual') as string)
    if (!url) { setFormError('Upload gambar atau isi URL gambar terlebih dahulu.'); return }
    fd.set('image_url', url)
    start(async () => {
      const result = await updateIklan(id, fd)
      if (result?.error) { setFormError(result.error); return }
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

      {/* Create Modal */}
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
                  className={inputCls + ' mt-1'}
                  onChange={(e) => { if (!uploadedUrl) setUploadedUrl(e.target.value) }}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Judul Banner</label>
                <input name="judul" required className={inputCls} placeholder="Promo Akhir Tahun" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi <span className="font-normal text-gray-400">(opsional)</span></label>
                <textarea name="deskripsi" rows={2} className={inputCls} placeholder="Keterangan singkat iklan..." />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">URL Tujuan Klik <span className="font-normal text-gray-400">(opsional)</span></label>
                <input name="link_url" type="url" className={inputCls} placeholder="https://..." />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Urutan Tampil</label>
                <input name="urutan" type="number" defaultValue={iklans.length + 1} className={inputCls} />
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

      {/* Edit Modal */}
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
                  className={inputCls + ' mt-1'}
                  onChange={(e) => setEditUploadedUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Judul Banner</label>
                <input name="judul" required defaultValue={(modal as Iklan).judul} className={inputCls} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi <span className="font-normal text-gray-400">(opsional)</span></label>
                <textarea name="deskripsi" rows={2} defaultValue={(modal as Iklan).deskripsi ?? ''} className={inputCls} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">URL Tujuan Klik <span className="font-normal text-gray-400">(opsional)</span></label>
                <input name="link_url" type="url" defaultValue={(modal as Iklan).link_url ?? ''} className={inputCls} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Urutan Tampil</label>
                <input name="urutan" type="number" defaultValue={(modal as Iklan).urutan} className={inputCls} />
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

// ── PAKET MANAGER ──────────────────────────────────────────────────────────────
export function PaketManager({ paketList }: { paketList: PaketInternet[] }) {
  const [modal, setModal] = useState<'create' | PaketInternet | null>(null)
  const [confirm, setConfirm] = useState<{
    itemName: string
    message: string
    confirmLabel: string
    onConfirm: () => void
  } | null>(null)
  const [pending, start] = useTransition()
  const [createImageUrl, setCreateImageUrl] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20'
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
          )})}
        </div>
      )}

      {/* Create Modal */}
      {modal === 'create' && (
        <Modal title="Tambah Paket Baru" onClose={() => setModal(null)}>
          <div className="max-h-[80vh] overflow-y-auto pr-1">
            <form action={handleCreate} className="space-y-4">
              {/* Gambar */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Gambar Paket <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <PaketImageUploader onUploaded={(url) => setCreateImageUrl(url)} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Nama Paket</label>
                <input name="nama_paket" required className={inputCls} placeholder="Paket Basic" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Kecepatan (Mbps)</label>
                  <input name="kecepatan_mbps" type="number" required className={inputCls} placeholder="10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Harga (Rp)</label>
                  <input name="harga" type="number" required className={inputCls} placeholder="150000" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi</label>
                <textarea name="deskripsi" rows={3} className={inputCls} placeholder="Cocok untuk penggunaan sehari-hari..." />
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

      {/* Edit Modal */}
      {modal && modal !== 'create' && (
        <Modal title="Edit Paket" onClose={() => setModal(null)}>
          <div className="max-h-[80vh] overflow-y-auto pr-1">
            <form action={(fd) => handleUpdate((modal as PaketInternet).id, fd)} className="space-y-4">
              {/* Gambar */}
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
                <input name="nama_paket" required defaultValue={(modal as PaketInternet).nama_paket} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Kecepatan (Mbps)</label>
                  <input name="kecepatan_mbps" type="number" required defaultValue={(modal as PaketInternet).kecepatan_mbps} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Harga (Rp)</label>
                  <input name="harga" type="number" required defaultValue={(modal as PaketInternet).harga} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi</label>
                <textarea name="deskripsi" rows={3} defaultValue={(modal as PaketInternet).deskripsi ?? ''} className={inputCls} />
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

// ── PROMO TAB ─────────────────────────────────────────────────────────────────
export function PromoManager({ promos }: { promos: Promo[] }) {
  const [modal, setModal] = useState<'create' | Promo | null>(null)
  const [confirm, setConfirm] = useState<{
    itemName: string
    message: string
    confirmLabel: string
    onConfirm: () => void
  } | null>(null)
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

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20'
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
              <input name="title" required className={inputCls} placeholder="Gratis Biaya Instalasi" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi</label>
              <textarea name="description" required rows={3} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs font-semibold text-gray-600">Tag</label>
                <input name="tag" required className={inputCls} placeholder="Pelanggan Baru" /></div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-600">Urutan</label>
                <input name="urutan" type="number" defaultValue={promos.length + 1} className={inputCls} /></div>
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
              <input name="title" required defaultValue={(modal as Promo).title} className={inputCls} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi</label>
              <textarea name="description" required rows={3} defaultValue={(modal as Promo).description} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs font-semibold text-gray-600">Tag</label>
                <input name="tag" required defaultValue={(modal as Promo).tag} className={inputCls} /></div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-600">Urutan</label>
                <input name="urutan" type="number" defaultValue={(modal as Promo).urutan} className={inputCls} /></div>
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

// ── FAQ TAB ───────────────────────────────────────────────────────────────────
export function FaqManager({ faqs }: { faqs: Faq[] }) {
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

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20'

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
              <input name="question" required className={inputCls} placeholder="Berapa lama proses pemasangan?" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Jawaban</label>
              <textarea name="answer" required rows={4} className={inputCls} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Urutan</label>
              <input name="urutan" type="number" defaultValue={faqs.length + 1} className={inputCls} /></div>
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
              <input name="question" required defaultValue={(modal as Faq).question} className={inputCls} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Jawaban</label>
              <textarea name="answer" required rows={4} defaultValue={(modal as Faq).answer} className={inputCls} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Urutan</label>
              <input name="urutan" type="number" defaultValue={(modal as Faq).urutan} className={inputCls} /></div>
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

// ── AREA LAYANAN TAB ──────────────────────────────────────────────────────────
export function AreaManager({ areas }: { areas: (AreaLayanan & { id: string })[] }) {
  const [showForm, setShowForm] = useState(false)
  const [createDefaults, setCreateDefaults] = useState<{ kecamatan: string; nagari: string }>({ kecamatan: '', nagari: '' })
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{ ids: string[]; itemName: string; message: string } | null>(null)
  const [pending, start] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20'

  const normalizedSearch = search.toLowerCase().trim()
  const filteredAreas = normalizedSearch
    ? areas.filter((area) =>
        `${area.kecamatan} ${area.nagari}`.toLowerCase().includes(normalizedSearch),
      )
    : areas

  const grouped = filteredAreas.reduce<Record<string, (AreaLayanan & { id: string })[]>>((acc, a) => {
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
              <input name="kecamatan" required defaultValue={createDefaults.kecamatan} className={inputCls} placeholder="Batang Anai" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Nagari / Kelurahan</label>
              <input name="nagari" required defaultValue={createDefaults.nagari} className={inputCls} placeholder="Lubuk Alung" /></div>
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
