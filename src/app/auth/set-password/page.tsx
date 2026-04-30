'use client'

import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [isPreparingSession, setIsPreparingSession] = useState(true)

  useEffect(() => {
    const syncRecoverySession = async () => {
      const supabase = await createClient()
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash

      if (!hash) {
        setIsPreparingSession(false)
        return
      }

      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (type === 'recovery' && accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          setError(sessionError.message)
        } else {
          window.history.replaceState(null, '', '/auth/set-password')
        }
      }

      setIsPreparingSession(false)
    }

    void syncRecoverySession()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    setIsLoading(true)
    const supabase = await createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    setIsLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-card"
        >
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-gray-900">Set Password</h1>
            <p className="mt-1 text-sm text-gray-500">Buat kata sandi baru untuk akun Anda.</p>
          </div>

          <div>
            <label htmlFor="password-baru" className="mb-1 block text-sm font-medium text-gray-700">
              Password Baru
            </label>
            <div className="relative">
              <input
                id="password-baru"
                type={showPass ? 'text' : 'password'}
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-sm transition focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Toggle password"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="konfirmasi-password" className="mb-1 block text-sm font-medium text-gray-700">
              Konfirmasi Password
            </label>
            <input
              id="konfirmasi-password"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
              required
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || isPreparingSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-pink py-3 font-display font-semibold text-white transition hover:bg-brand-pink-dark disabled:opacity-60"
          >
            {isLoading || isPreparingSession ? <Loader2 size={16} className="animate-spin" /> : null}
            {isPreparingSession ? 'Menyiapkan sesi...' : 'Simpan Password'}
          </button>
        </form>
      </main>
    </div>
  )
}
