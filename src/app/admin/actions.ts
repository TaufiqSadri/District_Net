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