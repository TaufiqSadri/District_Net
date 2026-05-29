import { Eye } from 'lucide-react'

interface ProofButtonProps {
  proofUrl: string | null
  customerName: string
  onViewProof: (url: string | null, name: string) => void
}

export default function ProofButton({
  proofUrl,
  customerName,
  onViewProof,
}: ProofButtonProps) {
  if (!proofUrl) {
    return <span className="text-[15px] font-medium text-slate-400">—</span>
  }

  return (
    <button
      type="button"
      onClick={() => onViewProof(proofUrl, customerName)}
      className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 text-xs font-semibold text-brand-purple transition hover:bg-violet-100"
    >
      <Eye size={12} />
      Lihat
    </button>
  )
}
