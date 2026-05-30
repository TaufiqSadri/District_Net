'use server'

import { revalidatePath } from 'next/cache'
import { markNotificationAsRead } from '@/lib/data/notifikasi'

export async function markNotificationAsReadAction(formData: FormData) {
  const notificationId = String(formData.get('notification_id') ?? '').trim()
  if (!notificationId) return

  await markNotificationAsRead(notificationId)
  revalidatePath('/dashboard', 'layout')
}
