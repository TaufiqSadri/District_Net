import { CheckCircle2, Wifi } from 'lucide-react'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { formatRupiah } from '@/lib/data/dashboardPelanggan'
import type { PaketInternet } from '@/types/database'

interface AvailablePackagesSectionProps {
  paketAktif: PaketInternet[]
  currentPackageId?: string | null
}

export default function AvailablePackagesSection({
  paketAktif,
  currentPackageId,
}: AvailablePackagesSectionProps) {
  return (
    <PanelSectionCard
      title="Paket Lain yang Tersedia"
      subtitle="Untuk mengganti paket, silakan hubungi admin setelah memilih paket yang diinginkan."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paketAktif.map((paket) => {
          const isCurrent = currentPackageId === paket.id

          return (
            <article
              key={paket.id}
              className={`rounded-[18px] border p-5 transition ${
                isCurrent
                  ? 'border-[#6741f5] bg-[#f7f4ff]'
                  : 'border-[#e5e7eb] bg-white hover:border-[#d8dcff]'
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[19px] font-semibold text-[#111827]">{paket.nama_paket}</h3>
                  <p className="mt-1 text-[14px] text-slate-500">{paket.kecepatan_mbps} Mbps</p>
                </div>
                <div
                  className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl ${
                    isCurrent ? 'bg-[#6741f5] text-white' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <Wifi size={18} />
                </div>
              </div>

              <p className="text-[28px] font-semibold leading-none text-[#6741f5]">
                {formatRupiah(paket.harga)}
              </p>
              <p className="mt-4 min-h-[48px] text-[14px] leading-6 text-slate-500">
                {paket.deskripsi ?? 'Tidak ada deskripsi paket.'}
              </p>

              <div className="mt-5">
                {isCurrent ? (
                  <PanelStatusBadge tone="emerald" icon={<CheckCircle2 size={13} />}>
                    Paket yang digunakan
                  </PanelStatusBadge>
                ) : (
                  <div className="rounded-xl border border-[#e5e7eb] bg-[#f8faff] px-3 py-2 text-[12px] font-medium text-slate-500">
                    Hubungi admin jika ingin beralih ke paket ini.
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </PanelSectionCard>
  )
}
