import Navbar from '@/components/Navbar'

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <div className="mx-auto h-12 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 space-y-4">
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </main>
    </div>
  )
}
