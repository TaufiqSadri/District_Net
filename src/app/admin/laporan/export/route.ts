import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0]!)
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`

  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
  ].join('\n')
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'tagihan'
  const admin = createAdminClient()

  let rows: Record<string, unknown>[] = []
  if (type === 'pelanggan') {
    const { data } = await admin.from('pelanggan').select('*').order('created_at', { ascending: false })
    rows = (data ?? []) as Record<string, unknown>[]
  } else if (type === 'pembayaran') {
    const { data } = await admin.from('pembayaran').select('*').order('tanggal_pembayaran', { ascending: false })
    rows = (data ?? []) as Record<string, unknown>[]
  } else if (type === 'komplain') {
    const { data } = await admin.from('komplain').select('*').order('tanggal', { ascending: false })
    rows = (data ?? []) as Record<string, unknown>[]
  } else {
    const { data } = await admin.from('tagihan').select('*').order('tahun', { ascending: false }).order('bulan', { ascending: false })
    rows = (data ?? []) as Record<string, unknown>[]
  }

  const csv = toCsv(rows)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${type}-export.csv"`,
    },
  })
}
