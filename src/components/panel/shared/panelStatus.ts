import type { PanelTone } from '@/components/panel/shared/PanelMetricCard'

export function getPanelTagihanTone(status: string): PanelTone {
  if (status === 'lunas') return 'emerald'
  if (status === 'menunggu_verifikasi') return 'amber'
  if (status === 'belum_bayar') return 'red'
  return 'slate'
}

export function getPanelVerificationTone(status: string): PanelTone {
  if (status === 'diterima') return 'emerald'
  if (status === 'menunggu') return 'amber'
  if (status === 'ditolak') return 'red'
  return 'slate'
}

export function getPanelSubscriptionTone(status: string): PanelTone {
  if (status === 'aktif') return 'emerald'
  if (status === 'proses_instalasi') return 'blue'
  if (status === 'pending') return 'amber'
  if (status === 'ditangguhkan') return 'orange'
  if (status === 'nonaktif') return 'red'
  return 'slate'
}
