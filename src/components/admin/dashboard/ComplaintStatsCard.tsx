interface ComplaintStatsCardProps {
  resolved: number
  unresolved: number
}

export default function ComplaintStatsCard({
  resolved,
  unresolved,
}: ComplaintStatsCardProps) {
  const total = resolved + unresolved
  const resolvedPercent = total > 0 ? Math.round((resolved / total) * 100) : 0
  const unresolvedPercent = total > 0 ? 100 - resolvedPercent : 0

  return (
    <section className="rounded-[18px] border border-[#dfe5ef] bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[22px] font-semibold text-slate-900">Statistik Pengaduan</h2>
        <span className="mt-1 text-sm font-normal text-slate-500">Monthly Trend</span>
      </div>
      <div className="mt-8 space-y-5">
        <ComplaintBar
          label="Resolved"
          percent={resolvedPercent}
          barClass="bg-emerald-500"
        />
        <ComplaintBar
          label="Unresolved"
          percent={unresolvedPercent}
          barClass="bg-red-700"
        />
      </div>
    </section>
  )
}

function ComplaintBar({
  label,
  percent,
  barClass,
}: {
  label: string
  percent: number
  barClass: string
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-900">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#edf2ff]">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
