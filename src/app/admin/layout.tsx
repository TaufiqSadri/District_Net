import AdminLayout from '@/components/admin/layout/AdminLayout'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { unstable_cache } from 'next/cache'

// Cache badge counts for 30 seconds — these don't need to be real-time
const getBadgeCounts = unstable_cache(
  async () => {
    const admin = createAdminClient()
    // Single query instead of two separate queries
    const [komplainResult, pembayaranResult] = await Promise.all([
      admin
        .from('komplain')
        .select('*', { count: 'exact', head: true })
        .eq('status', false),
      admin
        .from('pembayaran')
        .select('*', { count: 'exact', head: true })
        .eq('status_verifikasi', 'menunggu'),
    ])
    return {
      pendingCount: komplainResult.count ?? 0,
      paymentPendingCount: pembayaranResult.count ?? 0,
    }
  },
  ['admin-badge-counts'],
  { revalidate: 30 },
)

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') redirect('/login')

  const { pendingCount, paymentPendingCount } = await getBadgeCounts()
  const metadata = user.user_metadata as {
    nama_lengkap?: string
    full_name?: string
    avatar_url?: string
  }

  return (
    <AdminLayout
      pendingCount={pendingCount}
      paymentPendingCount={paymentPendingCount}
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
    </AdminLayout>
  )
}
