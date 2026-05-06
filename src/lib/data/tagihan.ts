import { createAdminClient } from '@/lib/supabase/admin'

export type TagihanStatus = 'belum_bayar' | 'menunggu_verifikasi' | 'lunas' | 'overdue'

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
  belum_bayar: number
  menunggu_verifikasi: number
  lunas: number
  overdue: number
}

export interface TagihanListResult {
  data: TagihanWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

function isOverdue(tagihan: {
  jatuh_tempo: string | null
  status_tagihan: string
}) {
  if (!tagihan.jatuh_tempo) return false

  const dueDate = new Date(tagihan.jatuh_tempo)
  dueDate.setHours(23, 59, 59, 999)

  return tagihan.status_tagihan !== 'lunas' && dueDate.getTime() < Date.now()
}

function normalizeStatus(tagihan: {
  jatuh_tempo: string | null
  status_tagihan: string
}): TagihanStatus {
  if (isOverdue(tagihan)) return 'overdue'
  if (tagihan.status_tagihan === 'belum_bayar') return 'belum_bayar'
  if (tagihan.status_tagihan === 'menunggu_verifikasi') return 'menunggu_verifikasi'
  return 'lunas'
}

export async function getTagihanStats(): Promise<TagihanStats> {
  const admin = createAdminClient()

  const { data, count } = await admin
    .from('tagihan')
    .select('status_tagihan, jatuh_tempo', { count: 'exact' })

  const rows = data ?? []

  return {
    total: count ?? rows.length,
    belum_bayar: rows.filter((item) => item.status_tagihan === 'belum_bayar' && !isOverdue(item)).length,
    menunggu_verifikasi: rows.filter((item) => item.status_tagihan === 'menunggu_verifikasi').length,
    lunas: rows.filter((item) => item.status_tagihan === 'lunas').length,
    overdue: rows.filter((item) => isOverdue(item)).length,
  }
}

export async function getAllTagihan({
  search = '',
  pelangganId,
  bulan = 'semua',
  tahun = 'semua',
  status = 'semua',
  sort = 'terbaru',
  page = 1,
  pageSize = 10,
}: {
  search?: string
  pelangganId?: string
  bulan?: string
  tahun?: string
  status?: TagihanStatus | 'semua'
  sort?: 'terbaru' | 'terlama'
  page?: number
  pageSize?: number
} = {}): Promise<TagihanListResult> {
  const admin = createAdminClient()
  const empty = { data: [], total: 0, page, pageSize, totalPages: 0 }

  let pelangganIds: string[] | null = null
  if (pelangganId) {
    pelangganIds = [pelangganId]
  } else if (search.trim()) {
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

  let baseQuery = admin.from('tagihan').select('*', { count: 'exact' })

  if (pelangganIds) {
    baseQuery = baseQuery.in('pelanggan_id', pelangganIds)
  }
  if (bulan !== 'semua') baseQuery = baseQuery.eq('bulan', Number(bulan))
  if (tahun !== 'semua') baseQuery = baseQuery.eq('tahun', Number(tahun))

  if (status === 'belum_bayar') {
    baseQuery = baseQuery.eq('status_tagihan', 'belum_bayar')
  } else if (status === 'menunggu_verifikasi') {
    baseQuery = baseQuery.eq('status_tagihan', 'menunggu_verifikasi')
  } else if (status === 'lunas') {
    baseQuery = baseQuery.eq('status_tagihan', 'lunas')
  }

  baseQuery = baseQuery
    .order('tahun', { ascending: sort === 'terlama' })
    .order('bulan', { ascending: sort === 'terlama' })
    .order('created_at', { ascending: sort === 'terlama' })

  const { data: allRows, count, error: tagihanErr } = await baseQuery

  if (tagihanErr) {
    console.error('getAllTagihan tagihan error:', tagihanErr)
    return empty
  }

  let rows = (allRows ?? []).map((row) => ({
    ...row,
    status_tagihan: normalizeStatus(row),
  })) as TagihanWithRelations[]

  if (status === 'overdue') {
    rows = rows.filter((row) => row.status_tagihan === 'overdue')
  }

  const total = rows.length
  if (rows.length === 0) {
    return { data: [], total, page, pageSize, totalPages: 0 }
  }

  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize)

  const uniquePelangganIds = Array.from(
    new Set(paginatedRows.map((r) => r.pelanggan_id).filter(Boolean)),
  )
  const { data: pelangganRows, error: pelangganErr } = await admin
    .from('pelanggan')
    .select('id, nama_lengkap, email, no_hp, paket_id')
    .in('id', uniquePelangganIds)

  if (pelangganErr) {
    console.error('getAllTagihan pelanggan enrich error:', pelangganErr)
  }

  const pelangganMap = Object.fromEntries((pelangganRows ?? []).map((p) => [p.id, p]))

  const tagihanIds = paginatedRows.map((r) => r.id)
  const { data: pembayaranRows, error: pembayaranErr } = await admin
    .from('pembayaran')
    .select('id, tagihan_id, bukti_pembayaran, status_verifikasi, tanggal_pembayaran, created_at')
    .in('tagihan_id', tagihanIds)

  if (pembayaranErr) {
    console.error('getAllTagihan pembayaran enrich error:', pembayaranErr)
  }

  const pembayaranByTagihan: Record<string, NonNullable<typeof pembayaranRows>> = {}
  for (const pembayaran of pembayaranRows ?? []) {
    if (!pembayaranByTagihan[pembayaran.tagihan_id]) {
      pembayaranByTagihan[pembayaran.tagihan_id] = []
    }
    pembayaranByTagihan[pembayaran.tagihan_id]!.push(pembayaran)
  }

  const enriched: TagihanWithRelations[] = paginatedRows.map((tagihan) => ({
    ...tagihan,
    pelanggan: pelangganMap[tagihan.pelanggan_id] ?? null,
    pembayaran: pembayaranByTagihan[tagihan.id] ?? [],
  }))

  return {
    data: enriched,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getTagihanById(tagihanId: string): Promise<TagihanWithRelations | null> {
  const admin = createAdminClient()
  const { data: row, error } = await admin.from('tagihan').select('*').eq('id', tagihanId).single()

  if (error || !row) return null

  const [{ data: pelanggan }, { data: pembayaran }] = await Promise.all([
    admin
      .from('pelanggan')
      .select('id, nama_lengkap, email, no_hp, paket_id')
      .eq('id', row.pelanggan_id)
      .single(),
    admin
      .from('pembayaran')
      .select('id, tagihan_id, bukti_pembayaran, status_verifikasi, tanggal_pembayaran, created_at')
      .eq('tagihan_id', tagihanId)
      .order('created_at', { ascending: false }),
  ])

  return {
    ...row,
    status_tagihan: normalizeStatus(row),
    pelanggan: pelanggan ?? null,
    pembayaran: pembayaran ?? [],
  }
}

export async function searchTagihan(query: string): Promise<TagihanWithRelations[]> {
  const result = await getAllTagihan({ search: query, pageSize: 20 })
  return result.data
}

export async function markAsPaid(tagihanId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('tagihan').update({ status_tagihan: 'lunas' }).eq('id', tagihanId)
  if (error) throw new Error(error.message)
}

export async function updateTagihanByAdmin({
  tagihanId,
  jumlahTagihan,
  jatuhTempo,
  statusTagihan,
}: {
  tagihanId: string
  jumlahTagihan: number
  jatuhTempo: string | null
  statusTagihan: 'belum_bayar' | 'menunggu_verifikasi' | 'lunas'
}) {
  const admin = createAdminClient()
  const { error } = await admin
    .from('tagihan')
    .update({
      jumlah_tagihan: jumlahTagihan,
      jatuh_tempo: jatuhTempo,
      status_tagihan: statusTagihan,
    })
    .eq('id', tagihanId)

  if (error) throw new Error(error.message)
}

export async function deleteTagihan(tagihanId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('tagihan').delete().eq('id', tagihanId)
  if (error) throw new Error(error.message)
}
