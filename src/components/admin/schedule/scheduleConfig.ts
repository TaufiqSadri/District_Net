import type { AdminTone } from '@/components/admin/shared/AdminMetricCard'
import type { StatusJadwalInstalasi } from '@/types/database'

export const scheduleStatusOptions: Array<{ value: StatusJadwalInstalasi | 'semua'; label: string }> = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'menunggu_jadwal', label: 'Menunggu Jadwal' },
  { value: 'terjadwal', label: 'Terjadwal' },
  { value: 'dikerjakan', label: 'Dikerjakan' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
]

export const scheduleStatusTone: Record<StatusJadwalInstalasi, AdminTone> = {
  menunggu_jadwal: 'amber',
  terjadwal: 'blue',
  dikerjakan: 'violet',
  selesai: 'emerald',
  dibatalkan: 'red',
}

export function labelScheduleStatus(status: string) {
  return scheduleStatusOptions.find((item) => item.value === status)?.label ?? status
}
