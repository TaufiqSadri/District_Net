import { logoutAction } from '@/app/(public)/login/actions'
import PanelSectionCard from '@/components/panel/shared/PanelSectionCard'
import PanelStatusBadge from '@/components/panel/shared/PanelStatusBadge'
import { Ban } from 'lucide-react'

export default function InactiveAccountCard() {
  return (
    <PanelSectionCard className="w-full max-w-md">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Ban size={28} />
        </div>
        <h1 className="text-[24px] font-bold text-[#111827]">Akun Nonaktif</h1>
        <p className="mt-2 text-[14px] leading-6 text-slate-500">
          Langganan Anda saat ini tidak aktif. Silakan hubungi admin untuk informasi lebih lanjut.
        </p>
        <div className="mt-5 flex justify-center">
          <PanelStatusBadge tone="red">Nonaktif</PanelStatusBadge>
        </div>
        <p className="mt-6 text-xs text-slate-400">
          <a
            href="https://wa.me/6282170821291"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#6741f5]"
          >
            Hubungi WhatsApp Admin
          </a>
        </p>
        <form action={logoutAction} className="mt-6">
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
