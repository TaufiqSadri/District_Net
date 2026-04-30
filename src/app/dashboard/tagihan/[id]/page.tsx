export default function TagihanDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-card">
      <h1 className="font-display text-xl font-bold text-gray-900">Upload Pembayaran</h1>
      <p className="mt-2 text-sm text-gray-500">Tagihan ID: {params.id}</p>
      <p className="mt-4 text-sm text-gray-400">Form upload akan dihubungkan ke storage Supabase.</p>
    </div>
  )
}
