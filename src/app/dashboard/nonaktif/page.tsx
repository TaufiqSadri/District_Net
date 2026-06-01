import InactiveAccountCard from './sections/InactiveAccountCard'
import { getCurrentPelanggan } from '@/lib/data/pelanggan'
import { redirect } from 'next/navigation'

export default async function NonaktifPage() {
  const pelanggan = await getCurrentPelanggan()
  if (!pelanggan) redirect('/login')
  if (pelanggan.status_langganan === 'pending') redirect('/dashboard/pending')
  if (pelanggan.status_langganan === 'ditangguhkan') redirect('/dashboard')
  if (pelanggan.status_langganan !== 'nonaktif') redirect('/dashboard')

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8">
      <InactiveAccountCard />
    </div>
  )
}
