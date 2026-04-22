"use client";

import { MapPin, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "#package", label: "Package" },
  { href: "#promo", label: "Promo" },
  { href: "#faq", label: "FAQ" },
  { href: "#about", label: "About us" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/district_net.svg"
            alt="District Net"
            width={136}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-extrabold text-black md:flex">
          {navLinks.map((item) => (
            <li key={item.label}>
              <Link className="transition hover:text-brand-purple" href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <button className="rounded-full bg-brand-purple px-4 py-1.5 text-xs font-bold text-white">Login</button>
          <button className="flex items-center gap-2 rounded border border-gray-300 px-4 py-1.5 text-xs font-bold text-black">
            <MapPin className="h-3.5 w-3.5" />
            Check your location here
          </button>
          <button className="rounded bg-brand-yellow px-4 py-1.5 text-xs font-extrabold text-black">Subscribe Now</button>
        </div>

        <button
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          className="grid h-10 w-10 place-items-center rounded border border-gray-200 md:hidden"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-gray-100 bg-white px-5 pb-5 md:hidden">
          <ul className="grid gap-3 py-4 text-sm font-extrabold text-black">
            {navLinks.map((item) => (
              <li key={item.label}>
                <Link className="block py-1" href={item.href} onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="grid gap-2">
            <button className="h-10 rounded-full bg-brand-purple text-sm font-bold text-white">Login</button>
            <button className="flex h-10 items-center justify-center gap-2 rounded border border-gray-300 text-sm font-bold text-black">
              <MapPin className="h-4 w-4" />
              Check your location here
            </button>
            <button className="h-10 rounded bg-brand-yellow text-sm font-extrabold text-black">Subscribe Now</button>
          </div>
        </div>
      ) : null}
    </header>
  );
import { useState } from "react";

export default function Navbar() {
      const [open, setOpen] = useState<boolean>(false);
      const links = ["Package", "Promo", "FAQ", "About us"] as const;

      return (
            <nav className="sticky top-0 pt-1.5 z-50 bg-purple-950 border-b border-gray-100 shadow-sm">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

                        <a href="#" className="shrink-0 text-2xl font-extrabold tracking-tight">
                              <img className="h-14" src="/image.png" alt="Distric" />
                        </a>

                        <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                              {links.map((l) => (
                                    <li key={l}>
                                          <a href="#" className="hover:text-purple-700 transition-colors">{l}</a>
                                    </li>
                              ))}
                              <li>
                                    <a href="#" className="px-4 py-1.5 bg-purple-500 text-white rounded-2xl text-sm hover:bg-purple-800 transition-colors">
                                          Login
                                    </a>
                              </li>
                        </ul>

                        <div className="hidden md:flex items-center gap-2">
                              <button className="flex items-center gap-1.5 border border-gray-500 rounded-sm px-3 py-[7.5px] text-sm text-gray-400 hover:border-purple-400 transition-colors whitespace-nowrap">
                                    <svg className="w-3.5 h-3.5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    Check your location here
                              </button>
                              <a href="#" className="px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-sm text-sm hover:bg-yellow-600 transition-colors whitespace-nowrap" >
                                    Subscribe Now
                              </a>
                        </div>

                        <button className="md:hidden p-2 rounded-md text-gray-600" onClick={() => setOpen((currentOpen) => !currentOpen)} aria-label="Toggle menu">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                              </svg>
                        </button>
                  </div>

                  {open && (
                        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 text-sm font-medium text-gray-700">
                              {links.map((l) => <a key={l} href="#" className="hover:text-purple-700">{l}</a>)}
                              <a href="#" className="inline-block px-4 py-1.5 bg-purple-700 text-white rounded-full w-fit">Login</a>
                              <a href="#" className="inline-block px-4 py-1.5 bg-yellow-400 text-gray-900 font-semibold rounded-full w-fit">Subscribe Now</a>
                        </div>
                  )}
            </nav>
      );
}
