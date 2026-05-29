'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { submitPembayaran } from '@/app/dashboard/actions'
import { CheckCircle2, FileText, Loader2, UploadCloud } from 'lucide-react'

const PAYMENT_BUCKET = 'payment-proofs'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, '-')
}

export default function PaymentUploadForm({
  userId,
  tagihanId,
  defaultAmount,
}: {
  userId: string
  tagihanId: string
  defaultAmount: number
}) {
  const supabase = useMemo(() => createClient(), [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [isPdf, setIsPdf] = useState(false)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setUploadError('')

    if (!file) {
      setUploadedUrl('')
      setPreviewUrl('')
      setFileName('')
      setIsPdf(false)
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('File harus berupa JPG, PNG, WEBP, atau PDF.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Ukuran file maksimal 5 MB.')
      return
    }

    setUploading(true)

    const safeName = sanitizeFileName(file.name)
    const path = `${userId}/${tagihanId}/${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from(PAYMENT_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      setUploadError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(PAYMENT_BUCKET).getPublicUrl(path)

    setUploadedUrl(data.publicUrl)
    setPreviewUrl(URL.createObjectURL(file))
    setFileName(file.name)
    setIsPdf(file.type === 'application/pdf')
    setUploading(false)
  }

  return (
    <form action={submitPembayaran} className="space-y-4">
      <input type="hidden" name="tagihan_id" value={tagihanId} />
      <input type="hidden" name="bukti_pembayaran" value={uploadedUrl} />

      <div>
        <label className="mb-1.5 block text-[14px] font-medium text-slate-700">Jumlah Bayar</label>
        <input
          name="jumlah_bayar"
          type="number"
          min={0}
          defaultValue={defaultAmount}
          required
          className="w-full rounded-xl border-0 bg-[#f1f4fc] px-4 py-3 text-[15px] font-normal text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#6741f5]/25"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[14px] font-medium text-slate-700">Upload Bukti Pembayaran</label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-[#dfe5ef] bg-[#f8faff] px-4 py-8 text-center transition hover:border-[#6741f5]/40 hover:bg-white">
          <UploadCloud size={22} className="text-[#6741f5]" />
          <span className="mt-3 text-sm font-semibold text-slate-700">
            Pilih file bukti pembayaran
          </span>
          <span className="mt-1 text-xs text-slate-400">Format: JPG, PNG, WEBP, PDF - Maks 5 MB</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {uploading ? (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Loader2 size={16} className="animate-spin" />
          Mengunggah file ke storage...
        </div>
      ) : null}

      {uploadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {uploadError}
        </div>
      ) : null}

      {uploadedUrl ? (
        <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-700">
            <CheckCircle2 size={16} />
            File berhasil diunggah
          </div>

          <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white">
            {isPdf ? (
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FileText size={16} className="text-[#6741f5]" />
                  {fileName}
                </div>
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title="Preview bukti pembayaran"
                    className="h-72 w-full"
                  />
                ) : null}
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview bukti pembayaran"
                className="max-h-72 w-full object-contain"
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        File yang sudah diunggah akan langsung bisa dipreview oleh admin sebelum pembayaran disetujui.
      </div>

      <button
        type="submit"
        disabled={!uploadedUrl || uploading}
        className="h-12 w-full rounded-xl bg-[#6741f5] px-5 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Kirim Pembayaran
      </button>
    </form>
  )
}
