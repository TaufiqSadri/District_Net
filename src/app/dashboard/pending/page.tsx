import PendingAccountCard from './sections/PendingAccountCard'
import { getCurrentPelanggan } from '@/lib/data/pelanggan'
import { redirect } from 'next/navigation'

export default async function PendingPage() {
  const pelanggan = await getCurrentPelanggan()
  if (!pelanggan) redirect('/login')
  if (pelanggan.status_langganan === 'ditangguhkan') redirect('/dashboard')
  if (pelanggan.status_langganan === 'nonaktif') redirect('/dashboard/nonaktif')
  if (pelanggan.status_langganan !== 'pending') redirect('/dashboard')

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8">
      <PendingAccountCard />
    </div>
  )
}
