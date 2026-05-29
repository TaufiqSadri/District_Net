import InstallationSchedulePageContent from '@/components/admin/schedule/InstallationSchedulePageContent'
import { scheduleStatusOptions } from '@/components/admin/schedule/scheduleConfig'
import { getJadwalInstalasiList } from '@/lib/data/jadwalInstalasi'
import type { StatusJadwalInstalasi } from '@/types/database'

export default async function AdminJadwalInstalasiPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const status = scheduleStatusOptions.some((item) => item.value === searchParams?.status)
    ? (searchParams?.status as StatusJadwalInstalasi | 'semua')
    : 'semua'

  const result = await getJadwalInstalasiList({ status, pageSize: 50 })

  return <InstallationSchedulePageContent rows={result.data} status={status} />
}
