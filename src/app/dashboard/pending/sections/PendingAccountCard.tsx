import { logoutAction } from '@/app/(public)/login/actions'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { Clock } from 'lucide-react'

export default function PendingAccountCard() {
  return (
    <PanelSectionCard className="w-full max-w-md">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Clock size={28} />
        </div>
        <h1 className="text-[24px] font-bold text-[#111827]">Akun Sedang Diverifikasi</h1>
        <p className="mb-5 mt-2 text-[14px] leading-6 text-slate-500">
          Tim kami sedang memproses pendaftaran Anda. Estimasi 1x24 jam. Kami akan menghubungi Anda melalui email setelah disetujui.
        </p>
        <div className="mb-6 flex justify-center">
          <PanelStatusBadge tone="amber">
            Menunggu Persetujuan Admin
          </PanelStatusBadge>
        </div>
        <p className="mb-6 text-xs text-slate-400">
          Butuh bantuan?{' '}
          <a
            href="https://wa.me/6281256002100"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#6741f5]"
          >
            Hubungi WhatsApp Admin
          </a>
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="h-11 w-full rounded-xl border border-[#dfe5ef] text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            Keluar dari Akun
          </button>
        </form>
      </div>
    </PanelSectionCard>
  )
}
