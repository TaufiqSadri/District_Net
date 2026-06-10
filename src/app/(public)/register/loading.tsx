import Navbar from '@/components/Navbar'

export default function RegisterLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 justify-center px-4 py-12">
        <div className="w-full max-w-5xl space-y-8">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-10 w-64 animate-pulse rounded bg-slate-200" />
            <div className="mx-auto h-5 w-80 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-card md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
