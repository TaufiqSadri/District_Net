'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Ban, CheckCircle2, Loader2, Pencil, Trash2, UploadCloud, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { PaketInternet } from '@/types/database'

const IKLAN_BUCKET = 'iklan-banners'
const PAKET_BUCKET = 'paket-images'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const landingInputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20'

export type ConfirmState = {
  itemName: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function SubmitBtn({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-pink px-5 text-sm font-semibold text-white transition hover:bg-pink-900 disabled:opacity-60"
    >
      {pending && <Loader2 size={14} className="animate-spin" />}
      {label}
    </button>
  )
}

export function EditButton({
  onClick,
  label = 'Edit',
}: {
  onClick: () => void
  label?: string
}) {
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

export function ToggleButton({
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

export function DeleteButton({
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

export function getPackageLabel(paket: PaketInternet, index: number) {
  const name = paket.nama_paket.toLowerCase()
  if (name.includes('premium') || name.includes('enterprise') || index >= 2) return 'ENTERPRISE'
  if (name.includes('standar') || name.includes('popular') || index === 1) return 'MOST POPULAR'
  return 'ENTRY LEVEL'
}

export function getPackageFeatures(paket: PaketInternet) {
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

export function IklanImageUploader({
  defaultUrl,
  onUploaded,
}: {
  defaultUrl?: string
  onUploaded: (url: string) => void
}) {
  return (
    <ImageUploader
      bucket={IKLAN_BUCKET}
      defaultUrl={defaultUrl}
      readyAlt="Preview banner"
      uploadLabel="Klik untuk upload gambar"
      onUploaded={onUploaded}
    />
  )
}

export function PaketImageUploader({
  defaultUrl,
  onUploaded,
}: {
  defaultUrl?: string
  onUploaded: (url: string) => void
}) {
  return (
    <ImageUploader
      bucket={PAKET_BUCKET}
      defaultUrl={defaultUrl}
      readyAlt="Preview gambar paket"
      uploadLabel="Klik untuk upload gambar paket"
      emptyText="Belum ada gambar — paket akan tampil tanpa gambar."
      onUploaded={onUploaded}
    />
  )
}

function ImageUploader({
  bucket,
  defaultUrl,
  readyAlt,
  uploadLabel,
  emptyText,
  onUploaded,
}: {
  bucket: string
  defaultUrl?: string
  readyAlt: string
  uploadLabel: string
  emptyText?: string
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

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

    if (error) {
      setUploadError(error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
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
          {uploading ? 'Mengunggah...' : uploadLabel}
        </span>
        <span className="text-xs text-gray-400">JPG, PNG, WEBP, GIF · Maks 5 MB</span>
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>

      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}

      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-green-200 bg-green-50 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-green-700">
            <CheckCircle2 size={13} />
            Gambar siap
          </div>
          <div className="relative h-28 w-full overflow-hidden rounded-lg bg-gray-100">
            <img src={previewUrl} alt={readyAlt} className="h-full w-full object-cover" />
          </div>
        </div>
      ) : emptyText ? (
        <p className="text-xs text-gray-400">{emptyText}</p>
      ) : null}
    </div>
  )
}
