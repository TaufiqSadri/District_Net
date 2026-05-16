'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  MapPin,
  ChevronDown,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
} from 'lucide-react'
import type { AreaLayanan } from '@/types/database'

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'covered' | 'not-covered'

interface DropdownCoords {
  top: number
  left: number
  width: number
}

// ── Internal Combobox ─────────────────────────────────────────────────────────

interface ComboboxProps {
  id: string
  label: string
  placeholder: string
  options: string[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function Combobox({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [coords, setCoords] = useState<DropdownCoords>({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter berdasarkan query
  const filtered =
    query.trim() === ''
      ? options
      : options.filter((opt) =>
          opt.toLowerCase().includes(query.toLowerCase().trim())
        )

  // Hitung posisi dropdown dari trigger button
  function calcCoords() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width,
    })
  }

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node
      // Biarkan klik di dalam trigger atau dropdown
      if (triggerRef.current?.contains(target)) return
      const dropdownEl = document.getElementById(`${id}-dropdown`)
      if (dropdownEl?.contains(target)) return
      setOpen(false)
      setQuery('')
      setActiveIndex(-1)
    }

    function handleScroll() {
      calcCoords()
    }
    document.addEventListener('mousedown', handleOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, id])

  // Scroll item aktif ke dalam view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const item = listRef.current.children[activeIndex] as HTMLElement | null
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function handleOpen() {
    if (disabled) return
    calcCoords()
    setOpen(true)
    setQuery('')
    setActiveIndex(-1)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSelect(opt: string) {
    onChange(opt)
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && filtered[activeIndex]) {
          handleSelect(filtered[activeIndex])
        }
        break
      case 'Escape':
        setOpen(false)
        setQuery('')
        setActiveIndex(-1)
        break
    }
  }

  const hasValue = value !== ''

  // Dropdown dirender via portal ke document.body
  // supaya tidak terpotong oleh overflow/rounded parent manapun
  const dropdown = (
    <div
      id={`${id}-dropdown`}
      style={{
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 9999,
      }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
    >
      {/* Search input */}
      <div className="border-b border-gray-100 p-2">
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Cari ${label.toLowerCase()}...`}
            className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-7 pr-3 text-sm outline-none transition focus:border-[#68247B] focus:bg-white focus:ring-1 focus:ring-[#68247B]/20"
          />
        </div>
      </div>

      {/* Options — max 4 baris, tiap baris ~40px */}
      <ul
        ref={listRef}
        role="listbox"
        aria-label={label}
        className="max-h-[160px] overflow-y-auto py-1"
      >
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-center text-sm text-gray-400">
            {query ? `Tidak ditemukan "${query}"` : 'Tidak ada pilihan tersedia'}
          </li>
        ) : (
          filtered.map((opt, i) => {
            const isActive = i === activeIndex
            const isSelected = opt === value
            return (
              <li
                key={opt}
                role="option"
                aria-selected={isSelected}
                onMouseDown={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(i)}
                className={[
                  'flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm transition-colors',
                  isActive || isSelected
                    ? 'bg-purple-50 text-[#68247B]'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-[#68247B]',
                  isSelected ? 'font-semibold' : '',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <MapPin size={12} className="shrink-0 text-gray-400" />
                  {opt}
                </span>
                {isSelected ? (
                  <CheckCircle2 size={13} className="shrink-0 text-[#68247B]" />
                ) : null}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )

  return (
    <div className="relative w-full">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={handleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={[
          'flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-[#68247B]/20',
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
            : hasValue
            ? 'cursor-pointer border-[#68247B] bg-white text-gray-900 hover:border-[#68247B]/80'
            : 'cursor-pointer border-gray-300 bg-white text-gray-400 hover:border-[#68247B]/60',
        ].join(' ')}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <MapPin
            size={14}
            className={`shrink-0 ${hasValue ? 'text-[#68247B]' : 'text-gray-400'}`}
          />
          <span className={`truncate ${hasValue ? 'text-gray-900' : 'text-gray-400'}`}>
            {hasValue ? value : placeholder}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-0.5">
          {hasValue && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onChange('')
                }
              }}
              aria-label={`Hapus pilihan ${label}`}
              className="grid h-5 w-5 cursor-pointer place-items-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={12} />
            </span>
          ) : null}
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Portal dropdown — melayang bebas di atas semua elemen */}
      {mounted && open ? createPortal(dropdown, document.body) : null}
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function LocationChecker({ areas }: { areas: AreaLayanan[] }) {
  const [selectedKecamatan, setSelectedKecamatan] = useState('')
  const [selectedNagari, setSelectedNagari] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [checking, setChecking] = useState(false)
  const [resultArea, setResultArea] = useState<AreaLayanan | null>(null)

  // Daftar kecamatan unik, diurutkan
  const kecamatanList = Array.from(
    new Set(areas.map((a) => a.kecamatan))
  ).sort()

  // Daftar nagari berdasarkan kecamatan yang dipilih, diurutkan
  const nagariList = selectedKecamatan
    ? areas
        .filter((a) => a.kecamatan === selectedKecamatan)
        .map((a) => a.nagari)
        .sort()
    : []

  const handleKecamatanChange = useCallback((value: string) => {
    setSelectedKecamatan(value)
    setSelectedNagari('')
    setStatus('idle')
    setResultArea(null)
  }, [])

  const handleNagariChange = useCallback((value: string) => {
    setSelectedNagari(value)
    setStatus('idle')
    setResultArea(null)
  }, [])

  function handleCheck() {
    if (!selectedKecamatan || !selectedNagari || checking) return
    setChecking(true)

    setTimeout(() => {
      const match = areas.find(
        (a) =>
          a.kecamatan === selectedKecamatan && a.nagari === selectedNagari
      )
      if (match) {
        setStatus('covered')
        setResultArea(match)
      } else {
        setStatus('not-covered')
        setResultArea(null)
      }
      setChecking(false)
    }, 400)
  }

  function handleReset() {
    setSelectedKecamatan('')
    setSelectedNagari('')
    setStatus('idle')
    setResultArea(null)
  }

  const canCheck = selectedKecamatan !== '' && selectedNagari !== ''

  return (
    <div className="mt-7 max-w-2xl rounded-xl border border-gray-200 bg-white p-4 shadow-[0_12px_28px_rgba(17,17,17,0.08)]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-50">
          <MapPin className="h-4 w-4 text-purple-900" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-black">Cek Jangkauan Area</p>
          <p className="text-[11px] text-gray-500">
            Kabupaten Padang Pariaman, Sumatera Barat
          </p>
        </div>
      </div>

      {/* Row: Kecamatan + Nagari + Tombol */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        {/* Kecamatan */}
        <div className="min-w-0 flex-1">
          <label
            htmlFor="kecamatan-select"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400"
          >
            Kecamatan
          </label>
          <Combobox
            id="kecamatan-select"
            label="Kecamatan"
            placeholder="Pilih kecamatan..."
            options={kecamatanList}
            value={selectedKecamatan}
            onChange={handleKecamatanChange}
          />
        </div>

        {/* Nagari */}
        <div className="min-w-0 flex-1">
          <label
            htmlFor="nagari-select"
            className={[
              'mb-1 block text-[11px] font-semibold uppercase tracking-wider transition-colors',
              selectedKecamatan ? 'text-gray-400' : 'text-gray-300',
            ].join(' ')}
          >
            Nagari / Desa
          </label>
          <Combobox
            id="nagari-select"
            label="Nagari"
            placeholder={
              selectedKecamatan ? 'Pilih nagari...' : 'Pilih kecamatan dulu'
            }
            options={nagariList}
            value={selectedNagari}
            onChange={handleNagariChange}
            disabled={!selectedKecamatan}
          />
        </div>

        {/* Tombol Cek */}
        <button
          type="button"
          onClick={handleCheck}
          disabled={!canCheck || checking}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#68247B] px-5 text-sm font-bold text-white transition hover:bg-purple-950 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
        >
          {checking ? <Loader2 size={15} className="animate-spin" /> : null}
          {checking ? 'Mengecek…' : 'Cek'}
        </button>
      </div>

      {/* Helper text saat idle & belum ada pilihan */}
      {status === 'idle' && !selectedKecamatan ? (
        <p className="mt-2 text-[11px] text-gray-400">
          Contoh:{' '}
          {areas.slice(0, 3).map((a, i) => (
            <span key={`${a.kecamatan}-${a.nagari}`}>
              <span className="font-medium text-gray-500">{a.nagari}</span>
              {i < 2 ? ', ' : ''}
            </span>
          ))}
        </p>
      ) : null}

      {/* Result: terjangkau */}
      {status === 'covered' && resultArea ? (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-green-800">
              Selamat! Area{' '}
              <span className="text-green-700">{resultArea.nagari}</span> sudah
              terjangkau.
            </p>
            <p className="mt-0.5 text-xs text-green-600">
              Kecamatan {resultArea.kecamatan} · Kab. Padang Pariaman — Anda
              bisa langsung daftar berlangganan.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-1.5 text-xs font-semibold text-green-700 underline underline-offset-2 hover:text-green-900"
            >
              Cek area lain
            </button>
          </div>
        </div>
      ) : null}

      {/* Result: belum terjangkau */}
      {status === 'not-covered' ? (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-orange-800">
              Area belum tersedia.
            </p>
            <p className="mt-0.5 text-xs text-orange-600">
              Nagari {selectedNagari}, Kec. {selectedKecamatan} belum masuk
              jangkauan kami. Hubungi admin untuk informasi lebih lanjut.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-1.5 text-xs font-semibold text-orange-700 underline underline-offset-2 hover:text-orange-900"
            >
              Cek area lain
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}