import { Eye } from 'lucide-react'

export default function ProofButton({ proofUrl }: { proofUrl: string | null }) {
  if (!proofUrl) {
    return <span className="text-[15px] font-medium text-slate-400">—</span>
  }

  return (
    <a
      href={proofUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 text-xs font-semibold text-brand-purple transition hover:bg-violet-100"
    >
      <Eye size={12} />
      Lihat
    </a>
  )
}
