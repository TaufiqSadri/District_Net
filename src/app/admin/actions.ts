'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function approvePelanggan(pelangganId: string, _formData: FormData) {
  const admin = createAdminClient()
  const { error } = await admin.from('pelanggan').update({ status_langganan: 'aktif' }).eq('id', pelangganId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function approvePembayaran(pembayaranId: string, tagihanId: string, _formData: FormData) {
  const admin = createAdminClient()
  await Promise.all([
    admin.from('pembayaran').update({ status_verifikasi: 'diterima' }).eq('id', pembayaranId),
    admin.from('tagihan').update({ status_tagihan: 'lunas' }).eq('id', tagihanId),
  ])
  revalidatePath('/admin')
  revalidatePath('/admin/verifikasi')
}

export async function rejectPembayaran(pembayaranId: string, catatan: string, _formData: FormData) {
  const admin = createAdminClient()
  await admin
    .from('pembayaran')
    .update({ status_verifikasi: 'ditolak', catatan_admin: catatan })
    .eq('id', pembayaranId)
  revalidatePath('/admin')
  revalidatePath('/admin/verifikasi')
}

export async function deactivatePelanggan(pelangganId: string, _formData: FormData) {
  const admin = createAdminClient()
  await admin.from('pelanggan').update({ status_langganan: 'nonaktif' }).eq('id', pelangganId)
  revalidatePath('/admin/pelanggan')
}

export async function activatePelanggan(pelangganId: string, _formData: FormData) {
  const admin = createAdminClient()
  await admin.from('pelanggan').update({ status_langganan: 'aktif' }).eq('id', pelangganId)
  revalidatePath('/admin/pelanggan')
}

export async function togglePelangganStatus(
  pelangganId: string,
  currentStatus: string,
  _formData: FormData
) {
  const admin = createAdminClient()

  const newStatus =
    currentStatus === 'aktif'
      ? 'nonaktif'
      : 'aktif'

  await admin
    .from('pelanggan')
    .update({
      status_langganan: newStatus,
    })
    .eq('id', pelangganId)

  revalidatePath('/admin/pelanggan')
}

/*
-----------------------------
  Function untuk CRUD Paket
-----------------------------
*/

export async function togglePaketStatus(
  paketId: string,
  isActive: boolean,
  _formData: FormData
) {
  const admin = createAdminClient()

  await admin
    .from('paket_internet')
    .update({
      is_active: !isActive
    })
    .eq('id', paketId)

  revalidatePath('/admin/paket')
}

export async function deletePaket(
  paketId: string,
  _formData: FormData
) {
  const admin = createAdminClient()

  await admin
    .from('paket_internet')
    .delete()
    .eq('id', paketId)

  revalidatePath('/admin/paket')
}

export async function addPaket(
  formData: FormData
) {
  const admin = createAdminClient()

  const nama_paket =
    formData.get('nama_paket') as string

  const kecepatan_mbps = Number(
    formData.get('kecepatan_mbps')
  )

  const harga = Number(
    formData.get('harga')
  )

  const deskripsi =
    formData.get('deskripsi') as string

  const createAnother =
    formData.get('create_another')

  const { error } = await admin
    .from('paket_internet')
    .insert({
      nama_paket,
      kecepatan_mbps,
      harga,
      deskripsi,
      is_active: true,
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/paket')

  if (createAnother) {
    redirect(
      `/admin/paket/create?reset=${Date.now()}`
    )
  }

  redirect('/admin/paket')
}

export async function updatePaket(
  paketId: string,
  formData: FormData
) {
  const admin = createAdminClient()

  const nama_paket =
    formData.get('nama_paket') as string

  const kecepatan_mbps = Number(
    formData.get('kecepatan_mbps')
  )

  const harga = Number(
    formData.get('harga')
  )

  const deskripsi =
    formData.get('deskripsi') as string

  const { error } = await admin
    .from('paket_internet')
    .update({
      nama_paket,
      kecepatan_mbps,
      harga,
      deskripsi,
    })
    .eq('id', paketId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/paket')

  redirect('/admin/paket')
}

/*
---------------------------------
  Function untuk CRUD Pelanggan
---------------------------------
*/

// ── Tambah pelanggan oleh admin ───────────────────────────────────────────────
export async function addPelangganByAdmin(formData: FormData) {
  const admin = createAdminClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (password !== confirmPassword) return { error: 'Password tidak cocok.' }
  if (password.length < 8) return { error: 'Password minimal 8 karakter.' }

  const nama_lengkap = formData.get('nama_lengkap') as string
  const email = formData.get('email') as string
  const no_hp = formData.get('no_hp') as string
  const alamat_pemasangan = formData.get('alamat_pemasangan') as string
  const paket_id = formData.get('paket_id') as string
  const status_langganan = (formData.get('status_langganan') as string) || 'aktif'
  const latRaw = formData.get('latitude') as string
  const lngRaw = formData.get('longitude') as string
  const tanggalRaw = formData.get('tanggal_bergabung') as string

  if (!nama_lengkap || !email || !no_hp || !alamat_pemasangan || !paket_id) {
    return { error: 'Semua field wajib diisi.' }
  }

  // Buat akun auth via admin API (tanpa email confirmation)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama_lengkap },
  })

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      return { error: 'Email ini sudah terdaftar.' }
    }
    return { error: authError.message }
  }

  if (!authData.user) return { error: 'Gagal membuat akun.' }

  const tanggal_bergabung = tanggalRaw
    ? new Date(tanggalRaw).toISOString()
    : new Date().toISOString()

  const { error: pelangganError } = await admin.from('pelanggan').insert({
    user_id: authData.user.id,
    nama_lengkap,
    email,
    no_hp,
    alamat_pemasangan,
    latitude: latRaw ? Number(latRaw) : null,
    longitude: lngRaw ? Number(lngRaw) : null,
    paket_id,
    status_langganan,
    tanggal_bergabung,
  })

  if (pelangganError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: 'Gagal menyimpan data pelanggan.' }
  }

  revalidatePath('/admin/pelanggan')
  return { success: true }
}

// ── Update data pelanggan ─────────────────────────────────────────────────────
export async function updatePelangganByAdmin(pelangganId: string, formData: FormData): Promise<void> {
  const admin = createAdminClient()
 
  const nama_lengkap = formData.get('nama_lengkap') as string
  const no_hp = formData.get('no_hp') as string
  const alamat_pemasangan = formData.get('alamat_pemasangan') as string
  const paket_id = formData.get('paket_id') as string
  const status_langganan = formData.get('status_langganan') as string
  const latRaw = formData.get('latitude') as string
  const lngRaw = formData.get('longitude') as string
 
  const { error } = await admin
    .from('pelanggan')
    .update({
      nama_lengkap,
      no_hp,
      alamat_pemasangan,
      paket_id,
      status_langganan,
      latitude: latRaw ? Number(latRaw) : null,
      longitude: lngRaw ? Number(lngRaw) : null,
    })
    .eq('id', pelangganId)
 
  if (error) throw new Error(error.message)
 
  revalidatePath('/admin/pelanggan')
  revalidatePath(`/admin/pelanggan/${pelangganId}`)
  redirect(`/admin/pelanggan/${pelangganId}`)
}

// ── Delete pelanggan ──────────────────────────────────────────────────────────
export async function deletePelangganByAdmin(pelangganId: string, userId: string) {
  const admin = createAdminClient()

  await admin.from('pelanggan').delete().eq('id', pelangganId)
  await admin.auth.admin.deleteUser(userId)

  revalidatePath('/admin/pelanggan')
  redirect('/admin/pelanggan')
}