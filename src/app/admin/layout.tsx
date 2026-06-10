import PanelLayout from '@/components/panel/layout/PanelLayout'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const getBadgeCounts = unstable_cache(async () => {
  const admin = createAdminClient()
  const [ticketResult, pembayaranResult] = await Promise.all([
    admin
      .from('tiket_layanan')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
    admin
      .from('pembayaran')
      .select('*', { count: 'exact', head: true })
      .eq('status_verifikasi', 'menunggu'),
  ])

  return {
    pendingCount: ticketResult.count ?? 0,
    paymentPendingCount: pembayaranResult.count ?? 0,
  }
}, ['admin-badge-counts'], { revalidate: 15 })

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user
  if (!user || user.user_metadata?.role !== 'admin') redirect('/login')

  const { pendingCount, paymentPendingCount } = await getBadgeCounts()
  const metadata = user.user_metadata as {
    nama_lengkap?: string
    full_name?: string
    avatar_url?: string
  }

  return (
    <PanelLayout
      variant="admin"
      badgeCounts={{
        pending: pendingCount,
        payment: paymentPendingCount,
      }}
      user={{
        name:
          metadata.nama_lengkap ??
          metadata.full_name ??
          user.email?.split('@')[0] ??
          'Admin District',
        email: user.email ?? undefined,
        roleLabel: 'Super Administrator',
        avatarUrl: metadata.avatar_url ?? null,
      }}
    >
      {children}
    </PanelLayout>
  )
}
