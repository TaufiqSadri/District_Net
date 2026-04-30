import { createClient } from '@/lib/supabase/server'
import type { PelangganWithPaket } from '@/types/database'

export async function getCurrentPelanggan(): Promise<PelangganWithPaket | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('pelanggan')
    .select('*, paket_internet(*)')
    .eq('user_id', user.id)
    .single()

  if (error) return null
  return data as PelangganWithPaket
}
