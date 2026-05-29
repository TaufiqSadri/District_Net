interface InstallationActivityCardProps {
  newSignups: number
  bars: number[]
}

export default function InstallationActivityCard({
  newSignups,
  bars,
}: InstallationActivityCardProps) {
  const values = bars.length > 0 ? bars : [0, 0, 0, 0]
  const maxValue = Math.max(...values, 1)

  return (
    <section className="rounded-[18px] border border-[#dfe5ef] bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:p-8">
      <h2 className="text-[22px] font-semibold text-slate-900">Aktivitas Pemasangan</h2>
      <div className="mt-9 flex items-end justify-between gap-6">
        <div>
          <p className="text-[15px] font-medium text-slate-500">New Signups</p>
          <p className="mt-2 text-[30px] font-bold leading-none text-slate-900">
            +{newSignups}
            <span className="ml-2 text-[16px] font-normal text-emerald-500">
              this month
            </span>
          </p>
        </div>
        <div className="flex h-[78px] flex-shrink-0 items-end gap-2">
          {values.map((value, index) => {
            const height = value > 0 ? Math.max((value / maxValue) * 72, 22) : 22
            const colors = ['bg-[#d7cef9]', 'bg-[#b9a7f0]', 'bg-[#967fe9]', 'bg-[#5427e6]']

            return (
              <span
                key={`${value}-${index}`}
                className={`w-5 rounded-sm ${colors[index % colors.length]}`}
                style={{ height }}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
