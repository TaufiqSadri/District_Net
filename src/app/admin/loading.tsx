export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="h-9 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-12 w-56 animate-pulse rounded-xl bg-slate-100" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="mt-8 h-7 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-4 gap-4 bg-slate-50 px-6 py-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-4 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 border-t border-slate-100 px-6 py-5">
            {Array.from({ length: 4 }).map((__, childIndex) => (
              <div key={childIndex} className="h-5 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
