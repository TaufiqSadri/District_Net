'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/(public)/login/actions'
import { LogOut, X } from 'lucide-react'
import { adminNavGroups } from '@/constants/admin-menu'
import { customerNavGroups } from '@/constants/customer-menu'
import type { PanelTopbarUser } from '@/components/panel/layout/PanelTopbar'
import type { PanelVariant } from '@/components/panel/layout/PanelBreadcrumb'

type BadgeCounts = Partial<Record<string, number>>

interface PanelSidebarProps {
  open: boolean
  onClose: () => void
  variant: PanelVariant
  user: PanelTopbarUser
  badgeCounts?: BadgeCounts
}

function formatBadge(count: number) {
  if (count > 99) return '99+'
  return String(count)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function PanelSidebar({
  open,
  onClose,
  variant,
  user,
  badgeCounts = {},
}: PanelSidebarProps) {
  const closeLabel = variant === 'admin' ? 'Tutup menu admin' : 'Tutup menu pelanggan'

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[300px] flex-shrink-0 overflow-hidden border-r border-slate-200 bg-[#68247b] lg:flex">
        <SidebarContent variant={variant} user={user} badgeCounts={badgeCounts} />
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[70] bg-slate-950/45 lg:hidden"
          aria-label={closeLabel}
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-[80] flex w-[min(300px,calc(100vw-2rem))] transform overflow-hidden bg-[#68247b] shadow-2xl transition duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          variant={variant}
          user={user}
          badgeCounts={badgeCounts}
          onNavigate={onClose}
          onClose={onClose}
        />
      </aside>
    </>
  )
}

function SidebarContent({
  variant,
  user,
  badgeCounts,
  onNavigate,
  onClose,
}: {
  variant: PanelVariant
  user: PanelTopbarUser
  badgeCounts: BadgeCounts
  onNavigate?: () => void
  onClose?: () => void
}) {
  const pathname = usePathname()
  const navGroups = variant === 'admin' ? adminNavGroups : customerNavGroups
  const basePath = variant === 'admin' ? '/admin' : '/dashboard'

  const getBadge = (badgeKey?: string) => {
    const count = badgeKey ? badgeCounts[badgeKey] ?? 0 : 0

    if (!badgeKey || count <= 0) return null

    return (
      <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
        {formatBadge(count)}
      </span>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between px-7 py-6">
        <Link href="/" aria-label="District Net home" onClick={onNavigate}>
          <Image
            src="/district_net.svg"
            alt="District Net"
            width={164}
            height={52}
            priority
            className="h-[52px] w-auto object-contain"
          />
        </Link>
        {onClose ? (
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label={variant === 'admin' ? 'Tutup menu admin' : 'Tutup menu pelanggan'}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        ) : null}
      </div>

      {variant === 'customer' ? (
        <div className="mx-[18px] mb-3 rounded-[18px] bg-white/10 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] bg-white text-[13px] font-bold text-[#68247b]">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{user.name}</p>
              <p className="truncate text-[12px] font-medium text-white/60">{user.email}</p>
            </div>
          </div>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-[18px] pb-4 pt-4">
        <div className="flex flex-col gap-2">
          {navGroups.map((group) => (
            <div key={group.title} className="overflow-hidden">
              <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-white/75">
                {group.title}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const { href, label, icon: Icon } = item
                  const badgeKey = 'badgeKey' in item ? (item.badgeKey as string) : undefined
                  const active =
                    pathname === href || (href !== basePath && pathname.startsWith(href))

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      className={`flex min-h-11 items-center gap-3 border-l-2 px-5 py-3 text-[14px] font-normal tracking-wide transition ${
                        active
                          ? 'rounded-r border-black bg-[#eceef2] text-[#6e2786]'
                          : 'rounded-r border-transparent text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                      <span className="truncate">{label}</span>
                      {getBadge(badgeKey)}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="px-[18px] pb-6">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 rounded-r border-l-2 border-transparent px-5 py-3 text-left text-[14px] font-normal tracking-wide text-white transition hover:bg-white/10"
          >
            <LogOut size={20} />
            Logout
          </button>
        </form>
      </div>
    </div>
  )
}
