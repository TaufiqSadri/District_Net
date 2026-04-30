import { logoutAction } from '@/app/(public)/login/actions'
import { Ban } from 'lucide-react'

export default function NonaktifPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Ban size={28} className="text-red-600" />
        </div>
        <h1 className="font-display text-xl font-bold text-gray-900">Akun Nonaktif</h1>
        <p className="mt-2 text-sm text-gray-500">
          Langganan Anda saat ini tidak aktif. Silakan hubungi admin untuk informasi lebih lanjut.
        </p>
        <p className="mt-6 text-xs text-gray-400">
          <a
            href="https://wa.me/6282170821291"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-purple"
          >
            Hubungi WhatsApp Admin
          </a>
        </p>
        <form action={logoutAction} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
          >
            Keluar dari Akun
          </button>
        </form>
      </div>
    </div>
  )
}
