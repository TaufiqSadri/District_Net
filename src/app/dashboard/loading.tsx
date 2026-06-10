export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-9 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-40 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="mt-8 h-7 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-72 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-5 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="h-72 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-5 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
