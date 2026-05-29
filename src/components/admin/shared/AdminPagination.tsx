import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminPaginationProps {
  basePath: string
  itemLabel: string
  currentCount: number
  filteredTotal: number
  page: number
  totalPages: number
  searchParams: Record<string, string | undefined>
  omitParams?: string[]
}

export default function AdminPagination({
  basePath,
  itemLabel,
  currentCount,
  filteredTotal,
  page,
  totalPages,
  searchParams,
  omitParams = ['success', 'error'],
}: AdminPaginationProps) {
  const pages = buildPages(page, totalPages)

  return (
    <div className="flex flex-col gap-4 border-t border-[#e5e7eb] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[14px] font-normal text-slate-700">
        Menampilkan {currentCount} dari {filteredTotal} {itemLabel}
      </p>

      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <PageLink
            disabled={page <= 1}
            href={buildPageHref(basePath, searchParams, page - 1, omitParams)}
            ariaLabel="Halaman sebelumnya"
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
                href={buildPageHref(basePath, searchParams, item, omitParams)}
                ariaLabel={`Halaman ${item}`}
              >
                {item}
              </PageLink>
            ),
          )}

          <PageLink
            disabled={page >= totalPages}
            href={buildPageHref(basePath, searchParams, page + 1, omitParams)}
            ariaLabel="Halaman berikutnya"
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
  href,
  ariaLabel,
}: {
  children: ReactNode
  active?: boolean
  disabled?: boolean
  href: string
  ariaLabel: string
}) {
  const className = `inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
    active
      ? 'border-[#5b2fd6] bg-[#5b2fd6] text-white shadow-sm'
      : 'border-[#e5e7eb] bg-white text-slate-600 hover:bg-slate-50'
  } ${disabled ? 'pointer-events-none cursor-not-allowed text-slate-300 hover:bg-white' : ''}`

  return (
    <Link
      href={disabled || active ? '#' : href}
      aria-label={ariaLabel}
      aria-disabled={disabled || active}
      className={className}
    >
      {children}
    </Link>
  )
}

function buildPageHref(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  nextPage: number,
  omitParams: string[],
) {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value || key === 'page' || omitParams.includes(key)) return
    params.set(key, value)
  })
  if (nextPage > 1) params.set('page', String(nextPage))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
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
