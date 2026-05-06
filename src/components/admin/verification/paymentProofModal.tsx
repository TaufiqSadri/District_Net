'use client'

import { useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'

interface Props {
  url: string | null
  pelangganName: string
  onClose: () => void
}

export default function PaymentProofModal({ url, pelangganName, onClose }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="font-display font-semibold text-gray-900">Bukti Pembayaran</h3>
            <p className="mt-0.5 text-xs text-gray-400">{pelangganName}</p>
          </div>
          <div className="flex items-center gap-2">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <ExternalLink size={12} />
                Buka Original
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {url ? (
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <img
                src={url}
                alt={`Bukti pembayaran ${pelangganName}`}
                className="max-h-[60vh] w-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `<div class="flex flex-col items-center justify-center py-16 text-gray-400"><span class="text-4xl mb-3">📄</span><p class="text-sm font-medium">File tidak dapat ditampilkan</p><a href="${url}" target="_blank" class="mt-3 text-xs text-brand-purple hover:underline">Buka di tab baru</a></div>`
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="mb-3 text-4xl">📄</span>
              <p className="text-sm font-medium">Bukti pembayaran tidak tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}