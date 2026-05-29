'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'

const statusOptions = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'belum_bayar', label: 'Belum Dibayar' },
  { value: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
  { value: 'lunas', label: 'Lunas' },
  { value: 'overdue', label: 'Overdue' },
]

const monthOptions = [
  { value: 'semua', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

const currentYear = new Date().getFullYear()
const yearOptions = [
  { value: 'semua', label: 'Semua Tahun' },
  ...Array.from({ length: 4 }, (_, index) => {
    const year = currentYear - index
    return { value: String(year), label: String(year) }
  }),
]

export default function SearchFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMonthly = searchParams.get('jenis') !== 'instalasi'

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'semua') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      params.delete('page')
      params.delete('paket_id')
      return params.toString()
    },
    [searchParams],
  )

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '')
  }, [searchParams])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      const qs = createQueryString({ search: search || null })

      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname)
      })
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, createQueryString, pathname, router])

  function handleSelect(key: string, value: string) {
    const qs = createQueryString({ [key]: value })

    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  function toggleSort() {
    const current = searchParams.get('sort') ?? 'terbaru'
    const next = current === 'terbaru' ? 'terlama' : 'terbaru'
    const qs = createQueryString({ sort: next === 'terbaru' ? null : next })

    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  return (
    <section className="rounded-[18px] border border-[#e5e7eb] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={22}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, email, atau ID pelanggan..."
            className="h-12 w-full rounded-xl border-0 bg-[#f1f4fc] pl-12 pr-10 text-[15px] font-normal text-slate-800 outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-brand-purple/25"
            type="search"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Bersihkan pencarian"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        {isMonthly ? (
          <>
            <FilterSelect
              ariaLabel="Filter bulan tagihan"
              value={searchParams.get('bulan') ?? 'semua'}
              onChange={(value) => handleSelect('bulan', value)}
              options={monthOptions}
            />

            <FilterSelect
              ariaLabel="Filter tahun tagihan"
              value={searchParams.get('tahun') ?? 'semua'}
              onChange={(value) => handleSelect('tahun', value)}
              options={yearOptions}
            />
          </>
        ) : null}

        <FilterSelect
          ariaLabel="Filter status tagihan"
          value={searchParams.get('status') ?? 'semua'}
          onChange={(value) => handleSelect('status', value)}
          options={statusOptions}
        />

        <button
          type="button"
          onClick={toggleSort}
          className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f1f4fc] text-slate-600 transition hover:bg-slate-100 hover:text-brand-purple disabled:opacity-60"
          disabled={isPending}
          title={`Urutkan ${searchParams.get('sort') === 'terlama' ? 'terbaru' : 'terlama'}`}
          aria-label="Ubah urutan tagihan"
        >
          <SlidersHorizontal size={21} />
        </button>
      </div>
    </section>
  )
}

function FilterSelect({
  ariaLabel,
  value,
  onChange,
  options,
}: {
  ariaLabel: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="relative w-full flex-shrink-0 lg:w-auto">
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full min-w-[150px] appearance-none rounded-xl border-0 bg-[#f1f4fc] py-0 pl-4 pr-10 text-[15px] font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-brand-purple/25 lg:w-[154px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </label>
  )
}
