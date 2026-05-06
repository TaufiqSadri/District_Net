import { createAdminClient } from '@/lib/supabase/admin'

export type TagihanStatus = 'unpaid' | 'pending_verification' | 'paid' | 'overdue'

export interface TagihanWithRelations {
  id: string
  pelanggan_id: string
  bulan: number
  tahun: number
  jumlah_tagihan: number
  status_tagihan: TagihanStatus
  jatuh_tempo: string
  created_at: string
  pelanggan: {
    id: string
    nama_lengkap: string
    email: string
    no_hp: string
    paket_id: string | null
  } | null
  pembayaran: Array<{
    id: string
    tagihan_id: string
    bukti_pembayaran: string | null
    status_verifikasi: string
    tanggal_pembayaran: string | null
    created_at: string
  }>
}

export interface TagihanStats {
  total: number
  unpaid: number
  pending_verification: number
  paid: number
  overdue: number
}

export interface TagihanListResult {
  data: TagihanWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getTagihanStats(): Promise<TagihanStats> {
  const admin = createAdminClient()

  const [total, unpaid, pending_verification, paid, overdue] = await Promise.all([
    admin.from('tagihan').select('*', { count: 'exact', head: true }),
    admin.from('tagihan').select('*', { count: 'exact', head: true }).eq('status_pembayaran', 'unpaid'),
    admin.from('tagihan').select('*', { count: 'exact', head: true }).eq('status_pembayaran', 'pending_verification'),
    admin.from('tagihan').select('*', { count: 'exact', head: true }).eq('status_pembayaran', 'paid'),
    admin.from('tagihan').select('*', { count: 'exact', head: true }).eq('status_pembayaran', 'overdue'),
  ])

  return {
    total: total.count ?? 0,
    unpaid: unpaid.count ?? 0,
    pending_verification: pending_verification.count ?? 0,
    paid: paid.count ?? 0,
    overdue: overdue.count ?? 0,
  }
}

export async function getAllTagihan({
  search = '',
  bulan = 'semua',
  tahun = 'semua',
  status = 'semua',
  sort = 'terbaru',
  page = 1,
  pageSize = 10,
}: {
  search?: string
  bulan?: string
  tahun?: string
  status?: TagihanStatus | 'semua'
  sort?: 'terbaru' | 'terlama'
  page?: number
  pageSize?: number
} = {}): Promise<TagihanListResult> {
  const admin = createAdminClient()
  const empty = { data: [], total: 0, page, pageSize, totalPages: 0 }

  // ── Step 1: filter pelanggan IDs when searching ───────────────────────────
  let pelangganIds: string[] | null = null
  if (search.trim()) {
    const { data: matched, error: searchErr } = await admin
      .from('pelanggan')
      .select('id')
      .ilike('nama_lengkap', `%${search}%`)

    if (searchErr) {
      console.error('getAllTagihan search error:', searchErr)
      return empty
    }
    pelangganIds = (matched ?? []).map((p) => p.id)
    if (pelangganIds.length === 0) return empty
  }

  // ── Step 2: fetch tagihan rows (no relation join yet) ─────────────────────
  let tagihanQuery = admin
    .from('tagihan')
    .select('*', { count: 'exact' })

  if (pelangganIds) {
    tagihanQuery = tagihanQuery.in('pelanggan_id', pelangganIds)
  }
  if (bulan !== 'semua') tagihanQuery = tagihanQuery.eq('bulan', Number(bulan))
  if (tahun !== 'semua') tagihanQuery = tagihanQuery.eq('tahun', Number(tahun))
  if (status !== 'semua') tagihanQuery = tagihanQuery.eq('status_pembayaran', status)

  tagihanQuery = tagihanQuery.order('created_at', { ascending: sort === 'terlama' })

  const from = (page - 1) * pageSize
  tagihanQuery = tagihanQuery.range(from, from + pageSize - 1)

  const { data: tagihanRows, count, error: tagihanErr } = await tagihanQuery

  if (tagihanErr) {
    console.error('getAllTagihan tagihan error:', tagihanErr)
    return empty
  }

  const rows = tagihanRows ?? []
  const total = count ?? 0

  if (rows.length === 0) {
    return { data: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }

  // ── Step 3: enrich with pelanggan ─────────────────────────────────────────
  const uniquePelangganIds = [...new Set(rows.map((r) => r.pelanggan_id).filter(Boolean))]
  const { data: pelangganRows, error: pelangganErr } = await admin
    .from('pelanggan')
    .select('id, nama_lengkap, email, no_hp, paket_id')
    .in('id', uniquePelangganIds)

  if (pelangganErr) {
    console.error('getAllTagihan pelanggan enrich error:', pelangganErr)
  }

  const pelangganMap = Object.fromEntries(
    (pelangganRows ?? []).map((p) => [p.id, p]),
  )

  // ── Step 4: enrich with pembayaran ────────────────────────────────────────
  const tagihanIds = rows.map((r) => r.id)
  const { data: pembayaranRows, error: pembayaranErr } = await admin
    .from('pembayaran')
    .select('id, tagihan_id, bukti_pembayaran_url, status_verifikasi, tanggal_upload, created_at')
    .in('tagihan_id', tagihanIds)

  if (pembayaranErr) {
    console.error('getAllTagihan pembayaran enrich error:', pembayaranErr)
  }

  // Group pembayaran by tagihan_id
  const pembayaranByTagihan: Record<string, typeof pembayaranRows> = {}
  for (const p of pembayaranRows ?? []) {
    if (!pembayaranByTagihan[p.tagihan_id]) pembayaranByTagihan[p.tagihan_id] = []
    pembayaranByTagihan[p.tagihan_id]!.push(p)
  }

  // ── Step 5: assemble final result ─────────────────────────────────────────
  const enriched: TagihanWithRelations[] = rows.map((t) => ({
    ...t,
    status_pembayaran: t.status_pembayaran as TagihanStatus,
    pelanggan: pelangganMap[t.pelanggan_id] ?? null,
    pembayaran: pembayaranByTagihan[t.id] ?? [],
  }))

  return {
    data: enriched,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function searchTagihan(query: string): Promise<TagihanWithRelations[]> {
  const result = await getAllTagihan({ search: query, pageSize: 20 })
  return result.data
}

export async function markAsPaid(tagihanId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('tagihan')
    .update({ status_pembayaran: 'paid' })
    .eq('id', tagihanId)
  if (error) throw new Error(error.message)
}

export async function deleteTagihan(tagihanId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('tagihan').delete().eq('id', tagihanId)
  if (error) throw new Error(error.message)
}