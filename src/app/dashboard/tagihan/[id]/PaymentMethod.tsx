'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, QrCode } from 'lucide-react'

const PAYMENT_METHODS = [{ value: 'qris', label: 'QRIS' }]

export default function PaymentMethod() {
  const [selected, setSelected] = useState('qris')
  const [showQR, setShowQR] = useState(false)

  return (
    <div className="mt-6 border-t border-[#e5e7eb] pt-6">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <QrCode size={15} className="text-[#6741f5]" />
        Metode Pembayaran
      </p>

      <div className="flex items-center gap-2">
        {/* Dropdown */}
        <div className="relative flex-1">
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value)
              setShowQR(false)
            }}
            className="h-10 w-full appearance-none rounded-xl border-0 bg-[#f1f4fc] pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#6741f5]/25"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Tombol Pilih */}
        <button
          type="button"
          onClick={() => setShowQR(true)}
        className="h-10 rounded-xl bg-[#6741f5] px-4 text-sm font-semibold text-white transition hover:bg-[#5b2fd6] active:scale-95"
        >
          Pilih
        </button>
      </div>

      {/* QR Code Card */}
      {showQR && selected === 'qris' ? (
        <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm">
          <div className="bg-[#68247b] px-4 py-2 text-center">
            <span className="text-xs font-extrabold tracking-wide text-gray-100">
              QRIS · Scan untuk Bayar
            </span>
          </div>

          <div className="flex flex-col items-center px-6 py-6">
            {/* QR Image */}
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-inner">
              <Image
                src="/qris.png"
                alt="QR Code QRIS"
                width={180}
                height={180}
                className="block"
                priority
              />
            </div>

            <p className="mt-4 text-center text-xs font-semibold text-slate-500">
              Scan QRIS untuk pembayaran
            </p>

            {/* Hint */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-800">
              Setelah pembayaran, tetap kirim bukti pembayaran untuk verifikasi admin.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
