'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface PembayaranWithRelations {
  id: string
  tagihan_id: string
  bukti_pembayaran: string | null      // was: bukti_pembayaran_url
  status_verifikasi: string
  tanggal_pembayaran: string | null    // was: tanggal_upload
  jumlah_bayar: number
  catatan_admin: string | null
  created_at: string
  tagihan: {
    id: string
    bulan: number
    tahun: number
    jumlah_tagihan: number
    status_tagihan: string             // was: status_pembayaran
    pelanggan: {
      id: string
      nama_lengkap: string
      email: string
      no_hp: string
    } | null
  } | null
}

export interface VerificationStats {
  menunggu: number
  approvedCount: number
  rejectedCount: number
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

  let tagihanIds: string[] | null = null
  if (pelangganId) {
    const { data: tagihanMatched } = await admin
      .from('tagihan')
      .select('id')
      .eq('pelanggan_id', pelangganId)
    tagihanIds = (tagihanMatched ?? []).map((t) => t.id)
    if (tagihanIds.length === 0) return empty
  } else if (search.trim()) {
    const { data: matched } = await admin
      .from('pelanggan')
      .select('id')
      .ilike('nama_lengkap', `%${search}%`)
    const pelangganIds = (matched ?? []).map((p) => p.id)
    if (pelangganIds.length === 0) return empty

    const { data: tagihanMatched } = await admin
      .from('tagihan')
      .select('id')
      .in('pelanggan_id', pelangganIds)
    tagihanIds = (tagihanMatched ?? []).map((t) => t.id)
    if (tagihanIds.length === 0) return empty
  }

  let query = admin
    .from('pembayaran')
    .select('*', { count: 'exact' })

  if (tagihanIds) {
    query = query.in('tagihan_id', tagihanIds)
  }

  if (status !== 'semua') {
    query = query.eq('status_verifikasi', status)
  }

  query = query
    .order('tanggal_pembayaran', { ascending: sort === 'terlama' })
    .order('created_at', { ascending: sort === 'terlama' })

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data: pembayaranRows, count, error } = await query

  if (error) {
    console.error('getPendingPembayaran error:', error)
    return empty
  }

  const rows = pembayaranRows ?? []
  const total = count ?? 0

  if (rows.length === 0) {
    return { data: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }

  const uniqueTagihanIds = Array.from(new Set(rows.map((r) => r.tagihan_id)))
  const { data: tagihanRows } = await admin
    .from('tagihan')
    .select('id, bulan, tahun, jumlah_tagihan, status_tagihan, pelanggan_id')
    .in('id', uniqueTagihanIds)

  const tagihanMap = Object.fromEntries((tagihanRows ?? []).map((t) => [t.id, t]))

  const uniquePelangganIds = Array.from(
    new Set((tagihanRows ?? []).map((t) => t.pelanggan_id).filter(Boolean)),
  )
  const { data: pelangganRows } = await admin
    .from('pelanggan')
    .select('id, nama_lengkap, email, no_hp')
    .in('id', uniquePelangganIds)

  const pelangganMap = Object.fromEntries((pelangganRows ?? []).map((p) => [p.id, p]))

  const enriched: PembayaranWithRelations[] = rows.map((p) => {
    const tagihan = tagihanMap[p.tagihan_id] ?? null
    return {
      ...p,
      tagihan: tagihan
        ? { ...tagihan, pelanggan: pelangganMap[tagihan.pelanggan_id] ?? null }
        : null,
    }
  })

  return { data: enriched, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getPendingPembayaran(args: {
  search?: string
  sort?: 'terbaru' | 'terlama'
  page?: number
  pageSize?: number
} = {}) {
  return getPembayaranList({ ...args, status: 'menunggu' })
}

export async function getVerificationStats(): Promise<VerificationStats> {
  const admin = createAdminClient()

  const [menunggu, approved, rejected] = await Promise.allSettled([
    admin.from('pembayaran').select('*', { count: 'exact', head: true }).eq('status_verifikasi', 'menunggu'),
    admin.from('pembayaran').select('*', { count: 'exact', head: true }).eq('status_verifikasi', 'diterima'),
    admin.from('pembayaran').select('*', { count: 'exact', head: true }).eq('status_verifikasi', 'ditolak'),
  ])

  return {
    menunggu: menunggu.status === 'fulfilled' ? (menunggu.value.count ?? 0) : 0,
    approvedCount: approved.status === 'fulfilled' ? (approved.value.count ?? 0) : 0,
    rejectedCount: rejected.status === 'fulfilled' ? (rejected.value.count ?? 0) : 0,
  }
}

export async function approvePayment(pembayaranId: string, tagihanId: string): Promise<void> {
  const admin = createAdminClient()
  await Promise.all([
    admin.from('pembayaran').update({ status_verifikasi: 'diterima' }).eq('id', pembayaranId),
    admin.from('tagihan').update({ status_tagihan: 'lunas' }).eq('id', tagihanId),
  ])
  revalidatePath('/admin/verifikasi')
  revalidatePath('/admin')
}

export async function rejectPayment(pembayaranId: string, tagihanId: string): Promise<void> {
  const admin = createAdminClient()
  await Promise.all([
    admin.from('pembayaran').update({ status_verifikasi: 'ditolak' }).eq('id', pembayaranId),
    admin.from('tagihan').update({ status_tagihan: 'belum_bayar' }).eq('id', tagihanId),
  ])
  revalidatePath('/admin/verifikasi')
  revalidatePath('/admin')
}

export async function getPaymentDetail(pembayaranId: string): Promise<PembayaranWithRelations | null> {
  const admin = createAdminClient()
  const { data: p } = await admin.from('pembayaran').select('*').eq('id', pembayaranId).single()
  if (!p) return null

  const { data: tagihan } = await admin
    .from('tagihan')
    .select('id, bulan, tahun, jumlah_tagihan, status_tagihan, pelanggan_id')
    .eq('id', p.tagihan_id)
    .single()

  if (!tagihan) return { ...p, tagihan: null }

  const { data: pelanggan } = await admin
    .from('pelanggan')
    .select('id, nama_lengkap, email, no_hp')
    .eq('id', tagihan.pelanggan_id)
    .single()

  return { ...p, tagihan: { ...tagihan, pelanggan: pelanggan ?? null } }
}
