import { FileText } from 'lucide-react'

export default function InvoiceDownloadButton({ pdfUrl }: { pdfUrl: string | null }) {
  if (!pdfUrl) {
    return <span className="text-[15px] font-medium text-slate-400">—</span>
  }

  return (
    <a
      href={pdfUrl}
      download
      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-50 px-3 text-xs font-semibold text-brand-purple transition hover:bg-violet-100"
    >
      <FileText size={13} />
      Unduh Invoice
    </a>
  )
}
