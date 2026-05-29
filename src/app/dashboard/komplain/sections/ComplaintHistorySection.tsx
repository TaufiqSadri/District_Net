import { MessageSquareMore } from 'lucide-react'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import {
  getStatusKomplainMeta,
  type KomplainRow,
} from '@/lib/data/dashboardPelanggan'

interface ComplaintHistorySectionProps {
  komplain: KomplainRow[]
}

export default function ComplaintHistorySection({
  komplain,
}: ComplaintHistorySectionProps) {
  return (
    <PanelSectionCard
      title="Riwayat Komplain"
      subtitle="Daftar kendala yang pernah Anda sampaikan."
    >
      {komplain.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#dfe5ef] px-4 py-12 text-center text-[14px] text-slate-400">
          Anda belum pernah mengirim komplain.
        </div>
      ) : (
        <div className="space-y-4">
          {komplain.map((item) => {
            const badge = getStatusKomplainMeta(item.status)

            return (
              <article key={item.id} className="rounded-[18px] border border-[#e5e7eb] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[14px] font-medium text-slate-700">
                    {item.tanggal
                      ? new Date(item.tanggal).toLocaleString('id-ID')
                      : item.created_at
                      ? new Date(item.created_at).toLocaleString('id-ID')
                      : '-'}
                  </span>
                  <PanelStatusBadge tone={item.status ? 'emerald' : 'amber'}>
                    {badge.label}
                  </PanelStatusBadge>
                </div>

                <p className="text-[14px] leading-6 text-slate-600">{item.isi_komplain}</p>

                {item.respon_admin ? (
                  <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-[14px] leading-6 text-emerald-800">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <MessageSquareMore size={15} />
                      Respons admin:
                    </span>{' '}
                    {item.respon_admin}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </PanelSectionCard>
  )
}
