interface AdminInfoTileProps {
  label: string
  value: string
}

export default function AdminInfoTile({ label, value }: AdminInfoTileProps) {
  return (
    <div className="rounded-xl bg-[#f8faff] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-[14px] font-medium text-slate-800">{value}</p>
    </div>
  )
}
