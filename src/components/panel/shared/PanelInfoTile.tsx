interface PanelInfoTileProps {
  label: string
  value: string | number
  helper?: string
}

export default function PanelInfoTile({
  label,
  value,
  helper,
}: PanelInfoTileProps) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-[#f8faff] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-[15px] font-semibold text-[#111827]">
        {value}
      </p>
      {helper ? <p className="mt-1 text-[13px] text-slate-500">{helper}</p> : null}
    </div>
  )
}
