'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail } from 'lucide-react'
import { FormEvent, useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/set-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSuccess(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
              <Mail size={24} className="text-brand-purple" />
            </div>
            <h1 className="font-display text-xl font-bold text-gray-900">Lupa kata sandi</h1>
            <p className="mt-2 text-sm text-gray-500">
              Masukkan email akun pelanggan. Link reset password akan dikirim ke email tersebut.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
              />
            </div>

            {success ? (
              <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Jika email terdaftar, link reset password sudah dikirim. Cek inbox atau spam.
              </p>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-pink py-3 font-display font-semibold text-white transition hover:bg-brand-pink-dark disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Kirim Link Reset Password
            </button>
          </form>

          <a
            href="https://wa.me/6282170821291"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
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
