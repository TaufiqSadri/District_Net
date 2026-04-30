'use client'

import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
  
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
  
    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
  
    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Email atau password salah.')
      } else {
        setError(signInError.message)
      }
      setLoading(false)
      return
    }
  
    const user = data.user
    if (!user) {
      setError('Gagal login. Coba lagi.')
      setLoading(false)
      return
    }
  
    // ✅ Cek admin DULU
    const isAdmin = user.user_metadata?.role === 'admin'
    if (isAdmin) {
      window.location.href = '/admin'  // ← full reload biar middleware kebaca
      return
    }
  
    const { data: pelanggan } = await supabase
      .from('pelanggan')
      .select('status_langganan')
      .eq('user_id', user.id)
      .single()
  
    if (pelanggan) {
      if (pelanggan.status_langganan === 'pending') {
        window.location.href = '/dashboard/pending'
        return
      }
      if (pelanggan.status_langganan === 'nonaktif') {
        window.location.href = '/dashboard/nonaktif'
        return
      }
      window.location.href = '/dashboard'
      return
    }
  
    window.location.href = '/dashboard'
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-bold text-gray-900">Selamat Datang</h1>
            <p className="mt-1 text-sm text-gray-500">
              Masuk ke akun Distric Net Anda untuk mengelola layanan internet.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Alamat Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between">
                <label className="text-sm font-medium text-gray-700">Kata Sandi</label>
                <Link href="/auth/forgot-password" className="text-xs text-brand-purple hover:underline">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-sm transition focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-purple py-3 font-display font-semibold text-white transition hover:bg-brand-purple/90 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Masuk
            </button>

            <p className="text-center text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-brand-purple hover:underline">
                Daftar Sekarang
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
