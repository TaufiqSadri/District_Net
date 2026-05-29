interface CustomerStatusItem {
  label: string
  value: number
  colorClass: string
}

interface StatusDistributionCardProps {
  items: CustomerStatusItem[]
}

export default function StatusDistributionCard({
  items,
}: StatusDistributionCardProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <section className="rounded-[18px] border border-[#dfe5ef] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:p-8">
      <h2 className="text-xl font-semibold text-slate-900">
        Distribusi Status Pelanggan
      </h2>
      <div className="mt-10 space-y-5">
        {items.map((item) => {
          const width = item.value > 0 ? Math.max((item.value / maxValue) * 100, 3) : 0

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className={`h-2 w-2 rounded-full ${item.colorClass}`} />
                <span>{item.label}</span>
                <span className="ml-auto">{item.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#edf2ff]">
                <div
                  className={`h-full rounded-full ${item.colorClass}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
