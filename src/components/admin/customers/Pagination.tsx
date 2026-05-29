'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentCount: number
  filteredTotal: number
  page: number
  pageSize: number
  totalPages: number
}

export default function Pagination({
  currentCount,
  filteredTotal,
  page,
  totalPages,
}: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(nextPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages = buildPages(page, totalPages)

  return (
    <div className="flex flex-col gap-4 border-t border-[#e5e7eb] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[14px] font-normal text-slate-700">
        Menampilkan {currentCount} dari {filteredTotal} Pelanggan
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <PageButton
            disabled={page <= 1}
            ariaLabel="Halaman sebelumnya"
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft size={16} />
          </PageButton>

          {pages.map((item, index) =>
            item === 'dots' ? (
              <span key={`dots-${index}`} className="px-1 text-sm text-slate-400">
                ...
              </span>
            ) : (
              <PageButton
                key={item}
                active={item === page}
                onClick={() => goToPage(item)}
                ariaLabel={`Halaman ${item}`}
              >
                {item}
              </PageButton>
            ),
          )}

          <PageButton
            disabled={page >= totalPages}
            ariaLabel="Halaman berikutnya"
            onClick={() => goToPage(page + 1)}
          >
            <ChevronRight size={16} />
          </PageButton>
        </div>
      ) : null}
    </div>
  )
}

function PageButton({
  children,
  active,
  disabled,
  ariaLabel,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  disabled?: boolean
  ariaLabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || active}
      aria-label={ariaLabel}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
        active
          ? 'border-[#5b2fd6] bg-[#5b2fd6] text-white shadow-sm'
          : 'border-[#e5e7eb] bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white'
      }`}
    >
      {children}
    </button>
  )
}

function buildPages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: Array<number | 'dots'> = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) pages.push('dots')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < totalPages - 1) pages.push('dots')
  pages.push(totalPages)

  return pages
}
