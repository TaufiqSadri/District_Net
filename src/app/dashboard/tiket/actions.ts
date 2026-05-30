'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createTicket, getTicketDetail, sendTicketMessage } from '@/lib/data/tiket'
import { getCurrentPelanggan } from '@/lib/data/pelanggan'
import { markNotificationAsRead } from '@/lib/data/notifikasi'

async function requireDashboardPelanggan() {
  const pelanggan = await getCurrentPelanggan()

  if (!pelanggan) redirect('/login')
  if (pelanggan.status_langganan === 'pending') redirect('/dashboard/pending')
  if (pelanggan.status_langganan === 'nonaktif') redirect('/dashboard/nonaktif')

  return pelanggan
}

function redirectWithMessage(path: string, type: 'success' | 'error', message: string): never {
  redirect(`${path}?${type}=${encodeURIComponent(message)}`)
}

export async function createTicketAction(formData: FormData) {
  const pelanggan = await requireDashboardPelanggan()
  const subjek = String(formData.get('subjek') ?? '').trim()
  const pesanAwal = String(formData.get('pesan_awal') ?? '').trim()
  let ticketId: string | null = null

  try {
    const ticket = await createTicket({
      pelanggan_id: pelanggan.id,
      subjek,
      pesan_awal: pesanAwal,
    })
    ticketId = ticket.id
  } catch (error) {
    redirectWithMessage('/dashboard/tiket', 'error', error instanceof Error ? error.message : 'Gagal membuat tiket.')
  }

  revalidatePath('/dashboard/tiket')
  revalidatePath('/admin/tiket')
  redirectWithMessage(`/dashboard/tiket/${ticketId}`, 'success', 'Tiket layanan berhasil dibuat.')
}

export async function sendCustomerTicketMessageAction(tiketId: string, formData: FormData) {
  const pelanggan = await requireDashboardPelanggan()
  const pesan = String(formData.get('pesan') ?? '').trim()
  const ticket = await getTicketDetail(tiketId, pelanggan.id)

  if (!ticket) redirectWithMessage('/dashboard/tiket', 'error', 'Tiket tidak ditemukan.')

  try {
    await sendTicketMessage({
      tiket_id: tiketId,
      sender_type: 'pelanggan',
      sender_id: pelanggan.id,
      pesan,
    })
  } catch (error) {
    redirectWithMessage(`/dashboard/tiket/${tiketId}`, 'error', error instanceof Error ? error.message : 'Gagal mengirim pesan.')
  }

  revalidatePath('/dashboard/tiket')
  revalidatePath(`/dashboard/tiket/${tiketId}`)
  revalidatePath('/admin/tiket')
  revalidatePath(`/admin/tiket/${tiketId}`)
  redirectWithMessage(`/dashboard/tiket/${tiketId}`, 'success', 'Pesan berhasil dikirim.')
}

export async function markNotificationAsReadAction(notificationId: string, _formData: FormData) {
  const pelanggan = await requireDashboardPelanggan()
  await markNotificationAsRead(notificationId, pelanggan.id)
  revalidatePath('/dashboard')
}
