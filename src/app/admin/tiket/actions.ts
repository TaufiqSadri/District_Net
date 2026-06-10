'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  closeTicket,
  scheduleTicketService,
  sendTicketMessage,
} from '@/lib/data/tiket'

async function requireAdminUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') redirect('/login')
  return user.id
}

function redirectWithMessage(path: string, type: 'success' | 'error', message: string): never {
  redirect(`${path}?${type}=${encodeURIComponent(message)}`)
}

function parseDateTimeLocal(formData: FormData) {
  const date = String(formData.get('tanggal_jadwal') ?? '').trim()
  const time = String(formData.get('jam_jadwal') ?? '').trim()
  if (!date) return null
  const parsed = new Date(`${date}T${time || '09:00'}:00+07:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export async function sendAdminTicketMessageAction(tiketId: string, formData: FormData) {
  const userId = await requireAdminUserId()
  const pesan = String(formData.get('pesan') ?? '').trim()

  try {
    await sendTicketMessage({
      tiket_id: tiketId,
      sender_type: 'admin',
      sender_id: userId,
      pesan,
    })
  } catch (error) {
    redirectWithMessage(`/admin/tiket/${tiketId}`, 'error', error instanceof Error ? error.message : 'Gagal mengirim balasan.')
  }

  revalidatePath('/admin/tiket')
  revalidatePath(`/admin/tiket/${tiketId}`)
  revalidatePath(`/dashboard/tiket/${tiketId}`)
  redirectWithMessage(`/admin/tiket/${tiketId}`, 'success', 'Balasan berhasil dikirim.')
}

export async function closeTicketAction(tiketId: string, _formData: FormData) {
  await requireAdminUserId()

  try {
    await closeTicket(tiketId)
  } catch (error) {
    redirectWithMessage(`/admin/tiket/${tiketId}`, 'error', error instanceof Error ? error.message : 'Gagal menutup tiket.')
  }

  revalidatePath('/admin/tiket')
  revalidatePath(`/admin/tiket/${tiketId}`)
  revalidatePath(`/dashboard/tiket/${tiketId}`)
  redirectWithMessage(`/admin/tiket/${tiketId}`, 'success', 'Tiket berhasil ditutup.')
}

export async function scheduleTicketServiceAction(tiketId: string, formData: FormData) {
  await requireAdminUserId()

  const jenisJadwalRaw = String(formData.get('jenis_jadwal') ?? '')
  const tanggalJadwal = parseDateTimeLocal(formData)
  const teknisi = String(formData.get('teknisi') ?? '').trim()
  const catatanPelanggan = String(formData.get('catatan_pelanggan') ?? '').trim()
  const catatanInternal = String(formData.get('catatan_internal') ?? '').trim()

  if (jenisJadwalRaw !== 'pengecekan' && jenisJadwalRaw !== 'perbaikan') {
    return { success: false, message: 'Jenis jadwal harus pengecekan atau perbaikan.' }
  }
  if (!tanggalJadwal) {
    return { success: false, message: 'Tanggal jadwal wajib diisi.' }
  }

  const jenisJadwal = jenisJadwalRaw as 'pengecekan' | 'perbaikan'

  try {
    await scheduleTicketService({
      tiket_id: tiketId,
      jenis_jadwal: jenisJadwal,
      tanggal_jadwal: tanggalJadwal,
      teknisi,
      catatan_pelanggan: catatanPelanggan,
      catatan_internal: catatanInternal,
    })
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal membuat jadwal layanan.',
    }
  }

  return { success: true, message: 'Jadwal layanan berhasil dibuat.' }
}
