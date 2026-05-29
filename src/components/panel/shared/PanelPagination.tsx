'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PanelPaginationProps {
  itemLabel: string
  currentCount: number
  filteredTotal: number
  page: number
  totalPages: number
  basePath?: string
  omitParams?: string[]
}

export default function PanelPagination({
  itemLabel,
  currentCount,
  filteredTotal,
  page,
  totalPages,
  basePath,
  omitParams = ['success', 'error'],
}: PanelPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pages = buildPages(page, totalPages)

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    omitParams.forEach((key) => params.delete(key))

    if (nextPage > 1) {
      params.set('page', String(nextPage))
    } else {
      params.delete('page')
    }

    const query = params.toString()
    router.push(query ? `${basePath ?? pathname}?${query}` : basePath ?? pathname)
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[#e5e7eb] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[14px] font-normal text-slate-700">
        Menampilkan {currentCount} dari {filteredTotal} {itemLabel}
      </p>

      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <PageLink
            disabled={page <= 1}
            ariaLabel="Halaman sebelumnya"
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft size={16} />
          </PageLink>

          {pages.map((item, index) =>
            item === 'dots' ? (
              <span key={`dots-${index}`} className="px-1 text-sm text-slate-400">
                ...
              </span>
            ) : (
              <PageLink
                key={item}
                active={item === page}
                ariaLabel={`Halaman ${item}`}
                onClick={() => goToPage(item)}
              >
                {item}
              </PageLink>
            ),
          )}

          <PageLink
            disabled={page >= totalPages}
            ariaLabel="Halaman berikutnya"
            onClick={() => goToPage(page + 1)}
          >
            <ChevronRight size={16} />
          </PageLink>
        </div>
      ) : null}
    </div>
  )
}

function PageLink({
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
  const className = `inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
    active
      ? 'border-[#5b2fd6] bg-[#5b2fd6] text-white shadow-sm'
      : 'border-[#e5e7eb] bg-white text-slate-600 hover:bg-slate-50'
  } ${disabled ? 'pointer-events-none cursor-not-allowed text-slate-300 hover:bg-white' : ''}`

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || active}
      aria-label={ariaLabel}
      className={className}
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
  for (let item = start; item <= end; item += 1) pages.push(item)
  if (end < totalPages - 1) pages.push('dots')
  pages.push(totalPages)

  return pages
}
