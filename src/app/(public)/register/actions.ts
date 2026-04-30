'use server'

import { createClient } from '@/lib/supabase/server'
import type { RegisterFormData } from '@/types/database'
import { redirect } from 'next/navigation'

export async function registerAction(formData: FormData) {
  const supabase = await createClient()

  const data: RegisterFormData = {
    nama_lengkap: formData.get('nama_lengkap') as string,
    email: formData.get('email') as string,
    no_hp: formData.get('no_hp') as string,
    alamat_pemasangan: formData.get('alamat_pemasangan') as string,
    latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
    longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
    paket_id: formData.get('paket_id') as string,
  }

  if (
    !data.nama_lengkap ||
    !data.email ||
    !data.no_hp ||
    !data.alamat_pemasangan ||
    !data.paket_id
  ) {
    return { error: 'Semua field wajib diisi.' }
  }

  const tempPassword =
    Math.random().toString(36).slice(-8) +
    Math.random().toString(36).slice(-8).toUpperCase() +
    '!'

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: tempPassword,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        nama_lengkap: data.nama_lengkap,
      },
    },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { error: 'Email ini sudah terdaftar. Silakan login.' }
    }
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Gagal membuat akun. Coba lagi.' }
  }

  const { error: pelangganError } = await supabase.from('pelanggan').insert({
    user_id: authData.user.id,
    nama_lengkap: data.nama_lengkap,
    email: data.email,
    no_hp: data.no_hp,
    alamat_pemasangan: data.alamat_pemasangan,
    latitude: data.latitude,
    longitude: data.longitude,
    paket_id: data.paket_id,
    status_langganan: 'pending',
  })

  if (pelangganError) {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminSupabase = createAdminClient()
    await adminSupabase.auth.admin.deleteUser(authData.user.id)
    return { error: 'Gagal menyimpan data pendaftaran. Coba lagi.' }
  }

  await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password`,
  })

  redirect('/register/success')
}
