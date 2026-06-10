'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { syncSuspendedPelangganStatuses } from '@/lib/data/pelangganStatus'
import { ensureJadwalInstalasi } from '@/lib/data/jadwalInstalasi'

export interface PembayaranWithRelations {
  id: string
  tagihan_id: string | null
  tagihan_instalasi_id: string | null
  bukti_pembayaran: string | null
  status_verifikasi: string
  tanggal_pembayaran: string | null
  jumlah_bayar: number
  catatan_admin: string | null
  created_at: string
  tagihan: {
    id: string
    bulan: number
    tahun: number
    jumlah_tagihan: number
    status_tagihan: string
    pelanggan: {
      id: string
      nama_lengkap: string
      email: string
      no_hp: string
    } | null
  } | null
  tagihan_instalasi: {
    id: string
    jumlah_tagihan: number
    status_tagihan: string
    jatuh_tempo: string
    pelanggan: {
      id: string
      nama_lengkap: string
      email: string
      no_hp: string
    } | null
  } | null
}

const pembayaranSelect = `
  *,
  tagihan:tagihan_id (
    id,
    bulan,
    tahun,
    jumlah_tagihan,
    status_tagihan,
    pelanggan:pelanggan_id (
      id,
      nama_lengkap,
      email,
      no_hp
    )
  ),
  tagihan_instalasi:tagihan_instalasi_id (
    id,
    jumlah_tagihan,
    status_tagihan,
    jatuh_tempo,
    pelanggan:pelanggan_id (
      id,
      nama_lengkap,
      email,
      no_hp
    )
  )
`

type PelangganPaymentSearchRow = {
  id: string
  nama_lengkap: string | null
  email: string | null
  no_hp: string | null
}

function matchesPelangganSearch(row: PelangganPaymentSearchRow, searchTerm: string) {
  if (!searchTerm) return true

  const id = row.id.toLowerCase()
  const compactId = id.replace(/-/g, '')
  const displayId = `dn${compactId.slice(0, 6)}`
  const normalizedSearch = searchTerm
    .replace(/^#/, '')
    .replace(/^dn-?/, 'dn')
    .replace(/[^a-z0-9@.]/g, '')

  return (
    (row.nama_lengkap ?? '').toLowerCase().includes(searchTerm) ||
    (row.email ?? '').toLowerCase().includes(searchTerm) ||
    (row.no_hp ?? '').toLowerCase().includes(searchTerm) ||
    id.includes(searchTerm) ||
    compactId.includes(normalizedSearch.replace(/^dn/, '')) ||
    displayId.includes(normalizedSearch)
  )
}

async function pembayaranOrFilterForPelangganIds(admin: ReturnType<typeof createAdminClient>, pelangganIds: string[]) {
  const [{ data: tagihanMatched }, { data: instalMatched }] = await Promise.all([
    admin.from('tagihan').select('id').in('pelanggan_id', pelangganIds),
    admin.from('tagihan_instalasi').select('id').in('pelanggan_id', pelangganIds),
  ])
  const tagihanIds = (tagihanMatched ?? []).map((t) => t.id)
  const instalasiIds = (instalMatched ?? []).map((t) => t.id)
  if (tagihanIds.length === 0 && instalasiIds.length === 0) return null

  const parts: string[] = []
  if (tagihanIds.length) parts.push(`tagihan_id.in.(${tagihanIds.join(',')})`)
  if (instalasiIds.length) parts.push(`tagihan_instalasi_id.in.(${instalasiIds.join(',')})`)
  return parts.join(',')
}

export async function getPembayaranList({
  search = '',
  pelangganId,
  status = 'semua',
  sort = 'terbaru',
  page = 1,
  pageSize = 10,
}: {
  search?: string
  pelangganId?: string
  status?: 'semua' | 'menunggu' | 'diterima' | 'ditolak'
  sort?: 'terbaru' | 'terlama'
  page?: number
  pageSize?: number
} = {}): Promise<{ data: PembayaranWithRelations[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const admin = createAdminClient()
  const empty = { data: [], total: 0, page, pageSize, totalPages: 0 }

  let pelangganIds: string[] | null = null
  if (pelangganId) {
    pelangganIds = [pelangganId]
  } else if (search.trim()) {
    const searchTerm = search.trim().toLowerCase()
    const { data: matched, error: searchError } = await admin
      .from('pelanggan')
      .select('id, nama_lengkap, email, no_hp')

    if (searchError) {
      console.error('getPembayaranList search error:', searchError)
      return empty
    }

    pelangganIds = ((matched ?? []) as PelangganPaymentSearchRow[])
      .filter((row) => matchesPelangganSearch(row, searchTerm))
      .map((p) => p.id)
    if (pelangganIds.length === 0) return empty
  }

  let query = admin.from('pembayaran').select(pembayaranSelect, { count: 'exact' })

  if (pelangganIds) {
    const orFilter = await pembayaranOrFilterForPelangganIds(admin, pelangganIds)
    if (!orFilter) return empty
    query = query.or(orFilter)
  }

  if (status !== 'semua') {
    query = query.eq('status_verifikasi', status)
  }

  query = query
    .order('tanggal_pembayaran', { ascending: sort === 'terlama' })
    .order('created_at', { ascending: sort === 'terlama' })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('getPembayaranList error:', error)
    return empty
  }

  return {
    data: (data ?? []) as unknown as PembayaranWithRelations[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export async function getPendingPembayaran(args: {
  search?: string
  sort?: 'terbaru' | 'terlama'
  page?: number
  pageSize?: number
} = {}) {
  return getPembayaranList({ ...args, status: 'menunggu' })
}

export async function approvePayment(pembayaranId: string): Promise<void> {
  const admin = createAdminClient()
  const { data: row, error: fetchErr } = await admin
    .from('pembayaran')
    .select('tagihan_id, tagihan_instalasi_id')
    .eq('id', pembayaranId)
    .single()

  if (fetchErr || !row) throw new Error(fetchErr?.message ?? 'Pembayaran tidak ditemukan.')

  await admin.from('pembayaran').update({ status_verifikasi: 'diterima' }).eq('id', pembayaranId)

  let pelangganId: string | null = null
  let isInstalasiPayment = false
  let tagihanInstalasiId: string | null = null
  if (row.tagihan_id) {
    const { data } = await admin
      .from('tagihan')
      .update({ status_tagihan: 'lunas' })
      .eq('id', row.tagihan_id)
      .select('pelanggan_id')
      .single()
    pelangganId = data?.pelanggan_id ?? null
  } else if (row.tagihan_instalasi_id) {
    isInstalasiPayment = true
    tagihanInstalasiId = row.tagihan_instalasi_id
    const { data } = await admin
      .from('tagihan_instalasi')
      .update({ status_tagihan: 'lunas' })
      .eq('id', row.tagihan_instalasi_id)
      .select('pelanggan_id')
      .single()
    pelangganId = data?.pelanggan_id ?? null
  }

  if (pelangganId) {
    if (isInstalasiPayment) {
      await admin
        .from('pelanggan')
        .update({ status_langganan: 'proses_instalasi' })
        .eq('id', pelangganId)
        .neq('status_langganan', 'nonaktif')
      await ensureJadwalInstalasi({ admin, pelangganId, tagihanInstalasiId })
    } else {
      await syncSuspendedPelangganStatuses([pelangganId], { restoreCleared: true })
    }
  }
}

export async function rejectPayment(pembayaranId: string): Promise<void> {
  const admin = createAdminClient()
  const { data: row, error: fetchErr } = await admin
    .from('pembayaran')
    .select('tagihan_id, tagihan_instalasi_id')
    .eq('id', pembayaranId)
    .single()

  if (fetchErr || !row) throw new Error(fetchErr?.message ?? 'Pembayaran tidak ditemukan.')

  await admin.from('pembayaran').update({ status_verifikasi: 'ditolak' }).eq('id', pembayaranId)

  let pelangganId: string | null = null
  if (row.tagihan_id) {
    const { data } = await admin
      .from('tagihan')
      .update({ status_tagihan: 'belum_bayar' })
      .eq('id', row.tagihan_id)
      .select('pelanggan_id')
      .single()
    pelangganId = data?.pelanggan_id ?? null
  } else if (row.tagihan_instalasi_id) {
    const { data } = await admin
      .from('tagihan_instalasi')
      .update({ status_tagihan: 'belum_bayar', bukti_pembayaran: null })
      .eq('id', row.tagihan_instalasi_id)
      .select('pelanggan_id')
      .single()
    pelangganId = data?.pelanggan_id ?? null
  }

  if (pelangganId) {
    await syncSuspendedPelangganStatuses([pelangganId])
  }
}

export async function getPaymentDetail(pembayaranId: string): Promise<PembayaranWithRelations | null> {
  const admin = createAdminClient()

  const { data, error } = await admin.from('pembayaran').select(pembayaranSelect).eq('id', pembayaranId).single()

  if (error || !data) return null

  return data as unknown as PembayaranWithRelations
}
