'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Receipt,
  History,
  MessageSquare,
  UserX,
  UserCheck,
  Trash2,
} from 'lucide-react'
import type { PelangganWithPaket } from '@/types/database'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'

interface Props {
  pelanggan: PelangganWithPaket
  onStatusChange?: (id: string, newStatus: 'aktif' | 'nonaktif') => void
  onDelete?: (id: string) => void
}

export default function CustomerActions({ pelanggan, onStatusChange, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useOnClickOutside(ref, () => setOpen(false))

  const menuItems = [
    {
      icon: Eye,
      label: 'Lihat Detail',
      onClick: () => {
        router.push(`/admin/pelanggan/${pelanggan.id}`)
        setOpen(false)
      },
    },
    {
      icon: Pencil,
      label: 'Edit Pelanggan',
      onClick: () => {
        router.push(`/admin/pelanggan/${pelanggan.id}/edit`)
        setOpen(false)
      },
    },
    {
      icon: Receipt,
      label: 'Lihat Tagihan',
      onClick: () => {
        router.push(`/admin/tagihan?pelanggan=${pelanggan.id}`)
        setOpen(false)
      },
    },
    {
      icon: History,
      label: 'Riwayat Pembayaran',
      onClick: () => {
        router.push(`/admin/verifikasi?pelanggan=${pelanggan.id}`)
        setOpen(false)
      },
    },
    {
      icon: MessageSquare,
      label: 'Lihat Komplain',
      onClick: () => {
        router.push(`/admin/komplain?pelanggan=${pelanggan.id}`)
        setOpen(false)
      },
    },
    { divider: true },
    pelanggan.status_langganan === 'aktif'
      ? {
          icon: UserX,
          label: 'Nonaktifkan',
          className: 'text-orange-600 hover:bg-orange-50',
          onClick: () => {
            setOpen(false)
            startTransition(async () => {
              const { togglePelangganStatus } = await import('@/app/admin/actions')
              await togglePelangganStatus(pelanggan.id, pelanggan.status_langganan, new FormData())
              onStatusChange?.(pelanggan.id, 'nonaktif')
              router.refresh()
            })
          },
        }
      : {
          icon: UserCheck,
          label: 'Aktifkan',
          className: 'text-green-600 hover:bg-green-50',
          onClick: () => {
            setOpen(false)
            startTransition(async () => {
              const { togglePelangganStatus } = await import('@/app/admin/actions')
              await togglePelangganStatus(pelanggan.id, pelanggan.status_langganan, new FormData())
              onStatusChange?.(pelanggan.id, 'aktif')
              router.refresh()
            })
          },
        },
    {
      icon: Trash2,
      label: 'Hapus Pelanggan',
      className: 'text-red-600 hover:bg-red-50',
      onClick: () => {
        setOpen(false)
        if (confirm(`Hapus pelanggan "${pelanggan.nama_lengkap}"? Tindakan ini tidak bisa dibatalkan.`)) {
          startTransition(async () => {
            // Call delete action
            onDelete?.(pelanggan.id)
            router.refresh()
          })
        }
      },
    },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        aria-label="Aksi pelanggan"
      >
        {isPending ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
        ) : (
          <MoreHorizontal size={15} />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-9 z-50 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          {menuItems.map((item, i) => {
            if ('divider' in item) {
              return <div key={`div-${i}`} className="my-1 border-t border-gray-100" />
            }
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${
                  item.className ?? ''
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}