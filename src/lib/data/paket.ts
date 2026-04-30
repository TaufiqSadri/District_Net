import { createClient } from '@/lib/supabase/server'
import type { PaketInternet } from '@/types/database'

export async function getPaketAktif(): Promise<PaketInternet[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('paket_internet')
    .select('*')
    .eq('is_active', true)
    .order('harga', { ascending: true })

  if (error) {
    console.error('Error fetching paket:', error)
    return []
  }

  return data ?? []
}
