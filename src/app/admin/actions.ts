'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function approvePelanggan(pelangganId: string, _formData: FormData) {
  const admin = createAdminClient()
  const { error } = await admin.from('pelanggan').update({ status_langganan: 'aktif' }).eq('id', pelangganId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function terimaPembayaran(pembayaranId: string, tagihanId: string, _formData: FormData) {
  const admin = createAdminClient()
  await Promise.all([
    admin.from('pembayaran').update({ status_verifikasi: 'diterima' }).eq('id', pembayaranId),
    admin.from('tagihan').update({ status_tagihan: 'lunas' }).eq('id', tagihanId),
  ])
  revalidatePath('/admin')
  revalidatePath('/admin/verifikasi')
}

export async function tolakPembayaran(pembayaranId: string, catatan: string, _formData: FormData) {
  const admin = createAdminClient()
  await admin
    .from('pembayaran')
    .update({ status_verifikasi: 'ditolak', catatan_admin: catatan })
    .eq('id', pembayaranId)
  revalidatePath('/admin')
  revalidatePath('/admin/verifikasi')
}

export async function nonaktifkanPelanggan(pelangganId: string, _formData: FormData) {
  const admin = createAdminClient()
  await admin.from('pelanggan').update({ status_langganan: 'nonaktif' }).eq('id', pelangganId)
  revalidatePath('/admin/pelanggan')
}
