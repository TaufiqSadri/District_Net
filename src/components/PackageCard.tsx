'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Wifi } from 'lucide-react'
import { useState } from 'react'

export interface PackageCardProps {
  id: string
  nama_paket: string
  kecepatan_mbps: number
  harga: number
  deskripsi?: string | null
  image_url?: string | null
  isCurrent?: boolean // for dashboard paket page
}

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function getDescriptionLines(description?: string | null) {
  return (description ?? '')
    .replace(/\\n/g, '\n')
    .split(/\r?\n/)
    .flatMap((line) => line.split(/(?<=\.)\s+/))
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function PackageCard({
  nama_paket,
  kecepatan_mbps,
  harga,
  image_url,
  deskripsi,
  isCurrent,
}: PackageCardProps) {
  const [imgError, setImgError] = useState(false)
  const showImage = !!image_url && !imgError
  const descriptionLines = getDescriptionLines(deskripsi)

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        isCurrent
          ? 'border-brand-purple ring-2 ring-brand-purple/20'
          : 'border-gray-200'
      }`}
    >
      {/* Image / Fallback */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
        {showImage ? (
          <Image
            src={image_url!}
            alt={`Gambar paket ${nama_paket}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 shadow-sm backdrop-blur-sm">
              <Wifi size={32} className="text-[#68247B]" />
            </div>
          </div>
        )}

        {/* Speed badge overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-baseline gap-1 rounded-full bg-[#68247B]/90 px-3 py-1 backdrop-blur-sm">
            <span className="font-display text-xl font-black text-white leading-none">
              {kecepatan_mbps}
            </span>
            <span className="text-xs font-bold text-white/80">Mbps</span>
          </span>
        </div>

        {isCurrent && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow">
              Paket Anda
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name & Price */}
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold text-gray-900 leading-tight">
            {nama_paket}
          </h3>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="font-display text-2xl font-black text-[#68247B]">
              {formatRupiah(harga)}
            </span>
            <span className="text-xs text-gray-400 font-medium">/ bulan</span>
          </div>
        </div>

        {descriptionLines.length > 0 ? (
          <ul className="mb-5 flex-1 list-disc space-y-1.5 pl-5 text-sm leading-6 text-gray-600">
            {descriptionLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}

        {/* CTA Buttons */}
        <div className="mt-auto grid gap-2">
          <Link
            href="/register"
            className="grid h-11 place-items-center rounded-lg bg-[#68247B] text-sm font-bold text-white transition hover:bg-white hover:border hover:border-[#68247B] hover:text-[#68247B]"
          >
            Berlangganan Sekarang
          </Link>
          <a
            href="https://wa.me/6281256002100"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#68247B] bg-white text-sm font-bold text-[#68247B] transition hover:bg-[#68247B] hover:text-white"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Hubungi Sales
          </a>
        </div>
      </div>
    </article>
  )
}
