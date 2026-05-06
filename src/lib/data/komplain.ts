import { createAdminClient } from '@/lib/supabase/admin'

export interface KomplainWithPelanggan {
  id: string
  pelanggan_id: string | null
  tanggal: string | null
  isi_komplain: string
  status: boolean | null
  respon_admin: string | null
  created_at: string | null
  pelanggan: {
    id: string
    nama_lengkap: string
    email: string
    no_hp: string
  } | null
}

export interface KomplainListResult {
  data: KomplainWithPelanggan[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface KomplainStats {
  total: number
  menunggu: number
  selesai: number
  belumDirespons: number
}

export async function getKomplainStats(): Promise<KomplainStats> {
  const admin = createAdminClient()
  const { data, count } = await admin.from('komplain').select('status, respon_admin', { count: 'exact' })
  const rows = data ?? []

  return {
    total: count ?? rows.length,
    menunggu: rows.filter((item) => !item.status).length,
    selesai: rows.filter((item) => !!item.status).length,
    belumDirespons: rows.filter((item) => !item.respon_admin).length,
  }
}

export async function getAllKomplain({
  search = '',
  pelangganId,
  status = 'semua',
  sort = 'terbaru',
  page = 1,
  pageSize = 10,
}: {
  search?: string
  pelangganId?: string
  status?: 'semua' | 'menunggu' | 'selesai'
  sort?: 'terbaru' | 'terlama'
  page?: number
  pageSize?: number
} = {}): Promise<KomplainListResult> {
  const admin = createAdminClient()
  const empty = { data: [], total: 0, page, pageSize, totalPages: 0 }

  let pelangganIds: string[] | null = null
  if (pelangganId) {
    pelangganIds = [pelangganId]
  } else if (search.trim()) {
    const { data: pelanggan } = await admin
      .from('pelanggan')
      .select('id')
      .or(`nama_lengkap.ilike.%${search}%,email.ilike.%${search}%,no_hp.ilike.%${search}%`)

    pelangganIds = (pelanggan ?? []).map((item) => item.id)
    if (pelangganIds.length === 0) return empty
  }

  let query = admin.from('komplain').select('*', { count: 'exact' })

  if (pelangganIds) query = query.in('pelanggan_id', pelangganIds)
  if (status === 'menunggu') query = query.eq('status', false)
  if (status === 'selesai') query = query.eq('status', true)

  query = query.order('tanggal', { ascending: sort === 'terlama' }).order('created_at', {
    ascending: sort === 'terlama',
  })

  const from = (page - 1) * pageSize
  const { data: komplainRows, count, error } = await query.range(from, from + pageSize - 1)

  if (error) {
    console.error('getAllKomplain error:', error)
    return empty
  }

  const rows = komplainRows ?? []
  if (rows.length === 0) {
    return {
      data: [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    }
  }

  const pelangganIdsOnPage = Array.from(new Set(rows.map((item) => item.pelanggan_id).filter(Boolean)))
  const { data: pelangganRows } = await admin
    .from('pelanggan')
    .select('id, nama_lengkap, email, no_hp')
    .in('id', pelangganIdsOnPage)

  const pelangganMap = Object.fromEntries((pelangganRows ?? []).map((item) => [item.id, item]))

  return {
    data: rows.map((item) => ({
      ...item,
      pelanggan: item.pelanggan_id ? pelangganMap[item.pelanggan_id] ?? null : null,
    })),
    total: count ?? rows.length,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}
