import Link from 'next/link'
import { Wrench } from 'lucide-react'
import PanelAlert from '@/components/panel/shared/PanelAlert'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import type { TagihanInstalasi } from '@/types/database'

interface InstallationNoticeContent {
  title: string
  message: string
  action: string
}

interface InstallationBillingNoticeProps {
  suspended: boolean
  activeInstallationBill: TagihanInstalasi | null
  notice: InstallationNoticeContent
}

export default function InstallationBillingNotice({
  suspended,
  activeInstallationBill,
  notice,
}: InstallationBillingNoticeProps) {
  return (
    <>
      {suspended ? (
        <PanelAlert tone="warning">
          <p className="font-semibold">
            {activeInstallationBill ? notice.title : 'Layanan Ditangguhkan Sementara'}
          </p>
          <p className="mt-1 font-normal">
            {activeInstallationBill
              ? notice.message
              : 'Selesaikan tagihan bulanan yang melewati jatuh tempo, lalu status akan kembali aktif setelah pembayaran lunas.'}
          </p>
        </PanelAlert>
      ) : null}

      {activeInstallationBill ? (
        <PanelSectionCard className="border-orange-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600">
                <Wrench size={18} />
              </span>
              <div>
                <p className="text-[16px] font-semibold text-[#111827]">{notice.title}</p>
                <p className="mt-1 text-[14px] leading-6 text-slate-600">{notice.message}</p>
              </div>
            </div>
            <Link
              href={`/dashboard/tagihan-instalasi/${activeInstallationBill.id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              {notice.action}
            </Link>
          </div>
        </PanelSectionCard>
      ) : null}
    </>
  )
}
