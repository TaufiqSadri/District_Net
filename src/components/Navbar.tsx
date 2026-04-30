'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, MapPin } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/package', label: 'Package' },
  { href: '/promo', label: 'Promo' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About us' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-display text-2xl font-bold text-brand-pink">
          Distric<span className="text-brand-yellow">.</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition ${
                pathname === l.href
                  ? 'text-brand-pink'
                  : 'text-gray-600 hover:text-brand-pink'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-brand-purple"
          >
            <MapPin size={14} /> Check your location here
          </button>
          <Link
            href="/login"
            className="rounded-full border border-brand-purple px-4 py-1.5 text-sm font-medium text-brand-purple transition hover:bg-brand-purple/5"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-brand-yellow px-4 py-1.5 text-sm font-semibold text-gray-900 transition hover:bg-brand-yellow/90"
          >
            Subscribe Now
          </Link>
        </div>

        <button type="button" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium text-gray-700"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-xl border border-brand-purple px-4 py-2 text-center text-sm font-medium text-brand-purple"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-brand-yellow px-4 py-2 text-center text-sm font-semibold text-gray-900"
            onClick={() => setOpen(false)}
          >
            Subscribe Now
          </Link>
        </div>
      )}
    </header>
  )
}
