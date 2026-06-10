'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Eye,
  ImageIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import type {
  TagihanInstalasiWithRelations,
  TagihanWithRelations,
} from '@/lib/data/tagihan'
import {
  deleteTagihanAction,
  deleteTagihanInstalasiAction,
  markAsPaidAction,
  markAsPaidInstalasiAction,
} from '@/app/admin/actions'
import ConfirmDialog from '@/components/ConfirmDialog'

type ActionMenuProps =
  | {
      variant: 'bulanan'
      row: TagihanWithRelations
      onMarkPaid?: (id: string) => void
      onDelete?: (id: string) => void
    }
  | {
      variant: 'instalasi'
      row: TagihanInstalasiWithRelations
      onMarkPaid?: (id: string) => void
      onDelete?: (id: string) => void
    }

const DROPDOWN_HEIGHT = 220
const DROPDOWN_WIDTH = 208

interface DropdownCoords {
  top: number
  left?: number
  right?: number
}

function getDropdownCoords(btn: HTMLButtonElement): DropdownCoords {
  const rect = btn.getBoundingClientRect()
  const vh = window.innerHeight
  const spaceBelow = vh - rect.bottom
  const openUpward = spaceBelow < DROPDOWN_HEIGHT && rect.top > DROPDOWN_HEIGHT
  const rightEdge = window.innerWidth - rect.right

  const top = openUpward
    ? rect.top + window.scrollY - DROPDOWN_HEIGHT - 4
    : rect.bottom + window.scrollY + 4

  if (rect.right >= DROPDOWN_WIDTH) {
    return { top, right: rightEdge }
  }

  return { top, left: Math.max(8, rect.left) }
}

export default function ActionMenuButton(props: ActionMenuProps) {
  const { variant, row, onDelete, onMarkPaid } = props
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<DropdownCoords>({ top: 0, right: 0 })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return

    function handleOutside(event: MouseEvent | TouchEvent) {
      if (
        menuRef.current?.contains(event.target as Node) ||
        btnRef.current?.contains(event.target as Node)
      ) return

      setOpen(false)
    }

    function handleScroll() {
      setOpen(false)
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  function openMenu() {
    if (!btnRef.current) return
    setCoords(getDropdownCoords(btnRef.current))
    setOpen((prev) => !prev)
  }

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  function handleMarkPaid() {
    setOpen(false)
    startTransition(async () => {
      if (variant === 'instalasi') {
        await markAsPaidInstalasiAction(row.id)
      } else {
        await markAsPaidAction(row.id)
      }

      onMarkPaid?.(row.id)
    })
  }

  function confirmDeleteAction() {
    startTransition(async () => {
      onDelete?.(row.id)

      if (variant === 'instalasi') {
        await deleteTagihanInstalasiAction(row.id)
      } else {
        await deleteTagihanAction(row.id)
      }

      setConfirmDelete(false)
    })
  }

  const proofUrl = row.pembayaran?.[0]?.bukti_pembayaran ?? null
  const pelangganId = row.pelanggan?.id
  const canMarkPaid = row.status_tagihan !== 'lunas'
  const confirmItemName =
    variant === 'instalasi'
      ? row.pelanggan?.nama_lengkap ?? 'Tagihan instalasi'
      : `${row.pelanggan?.nama_lengkap ?? 'Pelanggan'} - ${row.bulan}/${row.tahun}`

  const dropdown = (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: coords.top,
        ...(coords.right !== undefined ? { right: coords.right } : { left: coords.left }),
        zIndex: 9999,
        width: DROPDOWN_WIDTH,
      }}
      className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-xl"
    >
      {variant === 'instalasi' ? (
        pelangganId ? (
          <MenuItem
            icon={Eye}
            label="Lihat Pelanggan"
            onClick={() => navigate(`/admin/pelanggan/${pelangganId}`)}
          />
        ) : null
      ) : (
        <MenuItem
          icon={Eye}
          label="Lihat Detail"
          onClick={() => navigate(`/admin/tagihan/${row.id}`)}
        />
      )}

      {proofUrl ? (
        <MenuItem
          icon={ImageIcon}
          label="Lihat Bukti Pembayaran"
          onClick={() => {
            setOpen(false)
            window.open(proofUrl, '_blank', 'noopener,noreferrer')
          }}
        />
      ) : null}

      {canMarkPaid ? (
        <MenuItem
          icon={CheckCircle2}
          label="Tandai Lunas"
          className="text-emerald-600 hover:bg-emerald-50"
          onClick={handleMarkPaid}
        />
      ) : null}

      <div className="my-1 border-t border-gray-100" />

      <MenuItem
        icon={Pencil}
        label="Edit Tagihan"
        onClick={() =>
          navigate(
            variant === 'instalasi'
              ? `/admin/tagihan/instalasi/${row.id}/edit`
              : `/admin/tagihan/${row.id}/edit`,
          )
        }
      />

      <MenuItem
        icon={Trash2}
        label="Hapus Tagihan"
        className="text-red-600 hover:bg-red-50"
        onClick={() => {
          setOpen(false)
          setConfirmDelete(true)
        }}
      />
    </div>
  )

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openMenu}
        disabled={isPending}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#c6c0de] transition hover:bg-violet-50 hover:text-brand-purple disabled:opacity-50"
        aria-label={variant === 'instalasi' ? 'Aksi tagihan instalasi' : 'Aksi tagihan'}
      >
        {isPending ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
        ) : (
          <MoreHorizontal size={15} />
        )}
      </button>

      {mounted && open ? createPortal(dropdown, document.body) : null}
      <ConfirmDialog
        open={confirmDelete}
        title={variant === 'instalasi' ? 'Konfirmasi Tagihan Instalasi' : 'Konfirmasi Tagihan'}
        itemName={confirmItemName}
        message={
          variant === 'instalasi'
            ? 'Tagihan instalasi ini akan dihapus permanen.'
            : 'Tagihan ini akan dihapus permanen.'
        }
        confirmLabel="Ya, Hapus"
        pending={isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteAction}
      />
    </>
  )
}

function MenuItem({
  icon: Icon,
  label,
  className = '',
  onClick,
}: {
  icon: typeof Eye
  label: string
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${className}`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}
