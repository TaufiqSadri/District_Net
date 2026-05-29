interface BillingStatusCardProps {
  paidAmount: number
  waitingAmount: number
  unpaidAmount: number
  paidPercent: number
  formatCurrency: (value: number) => string
}

export default function BillingStatusCard({
  paidAmount,
  waitingAmount,
  unpaidAmount,
  paidPercent,
  formatCurrency,
}: BillingStatusCardProps) {
  const total = paidAmount + waitingAmount + unpaidAmount
  const paidDeg = total > 0 ? (paidAmount / total) * 360 : 0
  const waitingDeg = total > 0 ? (waitingAmount / total) * 360 : 0
  const donutBackground =
    total > 0
      ? `conic-gradient(#5427e6 0deg ${paidDeg}deg, #f59e0b ${paidDeg}deg ${
          paidDeg + waitingDeg
        }deg, #d21b1b ${paidDeg + waitingDeg}deg 360deg)`
      : 'conic-gradient(#e8ecf7 0deg 360deg)'

  return (
    <section className="rounded-[18px] border border-[#dfe5ef] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:p-8">
      <h2 className="text-xl font-semibold text-slate-900">Status Tagihan</h2>
      <div className="mt-9 flex justify-center">
        <div
          className="flex h-[180px] w-[180px] items-center justify-center rounded-full"
          style={{ background: donutBackground }}
        >
          <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_1px_3px_rgba(15,23,42,0.08)]">
            <span className="text-[28px] font-bold leading-none text-slate-900">
              {paidPercent}%
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase text-slate-500">
              Dibayar
            </span>
          </div>
        </div>
      </div>
      <div className="mt-7 grid grid-cols-3 divide-x divide-slate-200 text-left">
        <BillingLegend label="Dibayar" value={formatCurrency(paidAmount)} colorClass="text-[#5427e6]" />
        <BillingLegend
          label="Menunggu Verifikasi"
          value={formatCurrency(waitingAmount)}
          colorClass="text-[#f59e0b]"
        />
        <BillingLegend label="Belum Dibayar" value={formatCurrency(unpaidAmount)} colorClass="text-[#d21b1b]" />
      </div>
    </section>
  )
}

function BillingLegend({
  label,
  value,
  colorClass,
}: {
  label: string
  value: string
  colorClass: string
}) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
      <p className={`mt-1 text-[15px] font-semibold ${colorClass}`}>{value}</p>
    </div>
  )
}
