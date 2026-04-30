import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <h1 className="font-display text-xl font-bold text-gray-900">Lupa kata sandi</h1>
          <p className="mt-2 text-sm text-gray-500">
            Hubungi admin melalui WhatsApp untuk reset akun, atau gunakan tautan reset password dari
            email jika sudah tersedia.
          </p>
          <a
            href="https://wa.me/6282170821291"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-yellow py-3 text-sm font-semibold text-gray-900 transition hover:bg-brand-yellow/90"
          >
            Hubungi WhatsApp Admin
          </a>
          <Link
            href="/login"
            className="mt-3 block text-center text-sm font-semibold text-brand-purple hover:underline"
          >
            Kembali ke login
          </Link>
        </div>
      </main>
    </div>
  )
}
