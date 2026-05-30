import InstallationSchedulePageContent from '@/app/admin/jadwal-instalasi/sections/InstallationSchedulePageContent'
import { scheduleStatusOptions, scheduleTypeOptions } from '@/app/admin/jadwal-instalasi/sections/scheduleConfig'
import { getJadwalInstalasiList, getScheduleCustomerOptions } from '@/lib/data/jadwalInstalasi'
import type { JenisJadwalLayanan, StatusJadwalInstalasi } from '@/types/database'

export default async function AdminJadwalInstalasiPage({
  searchParams,
}: {
  searchParams?: { status?: string; jenis?: string }
}) {
  const status = scheduleStatusOptions.some((item) => item.value === searchParams?.status)
    ? (searchParams?.status as StatusJadwalInstalasi | 'semua')
    : 'semua'
  const jenis = scheduleTypeOptions.some((item) => item.value === searchParams?.jenis)
    ? (searchParams?.jenis as JenisJadwalLayanan | 'semua')
    : 'semua'

  const [result, customers] = await Promise.all([
    getJadwalInstalasiList({ status, jenis, pageSize: 50 }),
    getScheduleCustomerOptions(),
  ])

  return (
    <InstallationSchedulePageContent
      rows={result.data}
      customers={customers}
      status={status}
      jenis={jenis}
    />
  )
}
