import type { PanelTone } from '@/components/panel/shared/PanelMetricCard'
import type { JenisJadwalLayanan, StatusJadwalInstalasi } from '@/types/database'

export const scheduleStatusOptions: Array<{ value: StatusJadwalInstalasi | 'semua'; label: string }> = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'menunggu_jadwal', label: 'Menunggu Jadwal' },
  { value: 'terjadwal', label: 'Terjadwal' },
  { value: 'dikerjakan', label: 'Dikerjakan' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
]

export const scheduleTypeOptions: Array<{ value: JenisJadwalLayanan | 'semua'; label: string }> = [
  { value: 'semua', label: 'Semua Jadwal' },
  { value: 'instalasi', label: 'Instalasi' },
  { value: 'pengecekan', label: 'Pengecekan' },
  { value: 'perbaikan', label: 'Perbaikan' },
]

export const scheduleStatusTone: Record<StatusJadwalInstalasi, PanelTone> = {
  menunggu_jadwal: 'amber',
  terjadwal: 'blue',
  dikerjakan: 'violet',
  selesai: 'emerald',
  dibatalkan: 'red',
}

export function labelScheduleStatus(status: string) {
  return scheduleStatusOptions.find((item) => item.value === status)?.label ?? status
}

export function labelScheduleType(type: string | null | undefined) {
  return scheduleTypeOptions.find((item) => item.value === type)?.label ?? type ?? 'Jadwal'
}
