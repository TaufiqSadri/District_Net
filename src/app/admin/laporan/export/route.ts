import React from 'react'
import { NextResponse } from 'next/server'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
const bulanLengkap = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]
const TAGIHAN_STATUSES = ['belum_bayar', 'menunggu_verifikasi', 'lunas']
const PELANGGAN_STATUSES = ['aktif', 'ditangguhkan', 'proses_instalasi', 'pending', 'nonaktif']
const PEMBAYARAN_STATUSES = ['menunggu', 'diterima', 'ditolak']

type PdfValue = string | number | boolean | null | undefined
type PdfRow = Record<string, PdfValue>

function parseMonth(value: string | null) {
  const month = Number(value)
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null
}

function parseYear(value: string | null) {
  const year = Number(value)
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : null
}

function isTagihanStatus(status: string | null) {
  return !!status && TAGIHAN_STATUSES.includes(status)
}

function getDateRange(month: number | null, year: number | null) {
  if (!year) return null

  const startMonth = month ? month - 1 : 0
  const start = new Date(Date.UTC(year, startMonth, 1))
  const end = month
    ? new Date(Date.UTC(year, startMonth + 1, 1))
    : new Date(Date.UTC(year + 1, 0, 1))

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  }
}

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID')
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('id-ID')
}

function formatRupiah(value: number) {
  return 'Rp ' + value.toLocaleString('id-ID')
}

function statusLabel(value: string | null | undefined) {
  if (!value) return 'Semua'
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function reportTitle(type: string) {
  if (type === 'pelanggan') return 'Laporan Pelanggan'
  if (type === 'pembayaran') return 'Laporan Pembayaran'
  if (type === 'tiket') return 'Laporan Tiket Layanan'
  return 'Laporan Tagihan'
}

function applyDateRange<T extends {
  gte: (column: string, value: unknown) => T
  lt: (column: string, value: unknown) => T
}>(query: T, column: string, month: number | null, year: number | null) {
  const range = getDateRange(month, year)
  if (!range) return query
  return query.gte(column, range.from).lt(column, range.to)
}

function normalizeCell(header: string, value: PdfValue) {
  if (typeof value === 'number' && header.toLowerCase().includes('jumlah')) {
    return formatRupiah(value)
  }
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  return String(value ?? '-')
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', padding: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  brand: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: '#68247B' },
  brandSub: { fontSize: 8, color: '#777', marginTop: 3 },
  titleWrap: { alignItems: 'flex-end' },
  reportLabel: { fontSize: 8, color: '#888', textAlign: 'right' },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1a0a2e', textAlign: 'right', marginTop: 3 },
  generatedAt: { fontSize: 8, color: '#555', textAlign: 'right', marginTop: 3 },
  divider: { height: 1.5, backgroundColor: '#68247B', marginBottom: 14 },
  filterBox: { flexDirection: 'row', backgroundColor: '#f9f7ff', borderRadius: 4, padding: 9, marginBottom: 14 },
  filterItem: { flex: 1 },
  filterLabel: { fontSize: 7, color: '#7c6b8e', textTransform: 'uppercase' },
  filterValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1a0a2e', marginTop: 2 },
  summary: { fontSize: 9, color: '#4b5563', marginBottom: 10 },
  table: { borderWidth: 0.5, borderColor: '#e5e7eb' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f0f9', borderBottomWidth: 0.5, borderBottomColor: '#d8cfe8' },
  headerCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#68247B', padding: 5 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#edf0f4', minHeight: 22 },
  rowAlt: { backgroundColor: '#fbfbfd' },
  cell: { fontSize: 7, color: '#374151', padding: 5 },
  empty: { padding: 18, fontSize: 9, color: '#6b7280', textAlign: 'center' },
  footer: { position: 'absolute', left: 28, right: 28, bottom: 18, borderTopWidth: 0.5, borderTopColor: '#e5e7eb', paddingTop: 7 },
  footerText: { fontSize: 7, color: '#9ca3af', textAlign: 'center' },
  pageNumber: { position: 'absolute', right: 28, bottom: 18, fontSize: 7, color: '#9ca3af' },
})

function LaporanDocument({
  type,
  headers,
  rows,
  month,
  year,
  status,
}: {
  type: string
  headers: string[]
  rows: PdfRow[]
  month: number | null
  year: number | null
  status: string | null
}) {
  const title = reportTitle(type)
  const generatedAt = new Date().toLocaleString('id-ID')
  const colFlex = headers.map((header) => {
    if (['Email', 'Alamat', 'Subjek', 'Bukti Pembayaran', 'Catatan Admin'].includes(header)) return 1.6
    if (['Nama', 'Nama Pelanggan', 'Paket'].includes(header)) return 1.25
    return 1
  })

  return React.createElement(
    Document,
    {
      title: title,
      author: 'Distric Net',
      subject: title,
    },
    React.createElement(
      Page,
      { size: 'A4', orientation: 'landscape', style: s.page },
      React.createElement(
        View,
        { style: s.header },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: s.brand }, 'Distric Net'),
          React.createElement(Text, { style: s.brandSub }, 'Penyedia Internet Broadband Unlimited'),
          React.createElement(Text, { style: s.brandSub }, 'Kab. Padang Pariaman, Sumatera Barat'),
          React.createElement(Text, { style: s.brandSub }, '+62 812 5600 2100  ·  @distric_net'),
        ),
        React.createElement(
          View,
          { style: s.titleWrap },
          React.createElement(Text, { style: s.reportLabel }, 'LAPORAN ADMIN'),
          React.createElement(Text, { style: s.title }, title),
          React.createElement(Text, { style: s.generatedAt }, `Dicetak: ${generatedAt}`),
        ),
      ),
      React.createElement(View, { style: s.divider }),
      React.createElement(
        View,
        { style: s.filterBox },
        React.createElement(
          View,
          { style: s.filterItem },
          React.createElement(Text, { style: s.filterLabel }, 'Bulan'),
          React.createElement(Text, { style: s.filterValue }, month ? bulanLengkap[month - 1] : 'Semua Bulan'),
        ),
        React.createElement(
          View,
          { style: s.filterItem },
          React.createElement(Text, { style: s.filterLabel }, 'Tahun'),
          React.createElement(Text, { style: s.filterValue }, year ? String(year) : 'Semua Tahun'),
        ),
        React.createElement(
          View,
          { style: s.filterItem },
          React.createElement(Text, { style: s.filterLabel }, 'Status'),
          React.createElement(Text, { style: s.filterValue }, statusLabel(status)),
        ),
        React.createElement(
          View,
          { style: s.filterItem },
          React.createElement(Text, { style: s.filterLabel }, 'Total Data'),
          React.createElement(Text, { style: s.filterValue }, `${rows.length} baris`),
        ),
      ),
      React.createElement(Text, { style: s.summary }, `Ringkasan data ${title.toLowerCase()} berdasarkan filter yang dipilih admin.`),
      React.createElement(
        View,
        { style: s.table },
        React.createElement(
          View,
          { style: s.tableHeader, fixed: true },
          headers.map((header, index) => React.createElement(
            Text,
            { key: header, style: [s.headerCell, { flex: colFlex[index] }] },
            header,
          )),
        ),
        rows.length > 0
          ? rows.map((row, rowIndex) => React.createElement(
              View,
              {
                key: rowIndex,
                style: rowIndex % 2 === 1 ? [s.row, s.rowAlt] : s.row,
                wrap: false,
              },
              headers.map((header, index) => React.createElement(
                Text,
                { key: header, style: [s.cell, { flex: colFlex[index] }] },
                normalizeCell(header, row[header]),
              )),
            ))
          : React.createElement(Text, { style: s.empty }, 'Tidak ada data untuk filter ini.'),
      ),
      React.createElement(
        View,
        { style: s.footer, fixed: true },
        React.createElement(Text, { style: s.footerText }, 'Dokumen ini digenerate otomatis dari sistem admin Distric Net.'),
      ),
      React.createElement(Text, {
        style: s.pageNumber,
        fixed: true,
        render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`,
      }),
    ),
  )
}

async function renderLaporanPdf(args: {
  type: string
  headers: string[]
  rows: PdfRow[]
  month: number | null
  year: number | null
  status: string | null
}) {
  const element = React.createElement(LaporanDocument, args)
  return await renderToBuffer(element as any)
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
  const month = parseMonth(searchParams.get('bulan'))
  const year = parseYear(searchParams.get('tahun'))
  const status = searchParams.get('status')
  const admin = createAdminClient()

  let headers: string[] = []
  let rows: PdfRow[] = []

  if (type === 'pelanggan') {
    headers = ['Nama', 'Email', 'No HP', 'Paket', 'Kecepatan Mbps', 'Status', 'Tanggal Bergabung', 'Alamat']
    let query = admin
      .from('pelanggan')
      .select('*, paket_internet(nama_paket, kecepatan_mbps, harga)')
      .order('created_at', { ascending: false })

    if (status && PELANGGAN_STATUSES.includes(status)) query = query.eq('status_langganan', status)
    query = applyDateRange(query, 'tanggal_bergabung', month, year)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    rows = (data ?? []).map((item: any) => {
      const paket = first(item.paket_internet)
      return {
        Nama: item.nama_lengkap,
        Email: item.email,
        'No HP': item.no_hp,
        Paket: paket?.nama_paket ?? '',
        'Kecepatan Mbps': paket?.kecepatan_mbps ?? '',
        Status: item.status_langganan,
        'Tanggal Bergabung': formatDate(item.tanggal_bergabung),
        Alamat: item.alamat_pemasangan,
      }
    })
  } else if (type === 'pembayaran') {
    headers = ['Tanggal Bayar', 'Nama Pelanggan', 'Email', 'Periode', 'Jumlah Bayar', 'Status Verifikasi', 'Status Tagihan', 'Bukti Pembayaran', 'Catatan Admin']
    const hasTagihanFilter = !!month || !!year || isTagihanStatus(status)
    let query = hasTagihanFilter
      ? admin
          .from('pembayaran')
          .select(`
            *,
            tagihan:tagihan_id!inner (
              bulan,
              tahun,
              status_tagihan,
              pelanggan:pelanggan_id ( nama_lengkap, email, no_hp )
            )
          `)
      : admin
          .from('pembayaran')
          .select(`
            *,
            tagihan:tagihan_id (
              bulan,
              tahun,
              status_tagihan,
              pelanggan:pelanggan_id ( nama_lengkap, email, no_hp )
            ),
            tagihan_instalasi:tagihan_instalasi_id (
              status_tagihan,
              pelanggan:pelanggan_id ( nama_lengkap, email, no_hp )
            )
          `)

    if (month) query = query.eq('tagihan.bulan', month)
    if (year) query = query.eq('tagihan.tahun', year)
    if (isTagihanStatus(status)) query = query.eq('tagihan.status_tagihan', status)
    if (status && PEMBAYARAN_STATUSES.includes(status)) query = query.eq('status_verifikasi', status)
    query = query.order('tanggal_pembayaran', { ascending: false })

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    rows = (data ?? []).map((item: any) => {
      const tagihan = first(item.tagihan)
      const instalasi = first(item.tagihan_instalasi)
      const pelanggan = first(tagihan?.pelanggan) ?? first(instalasi?.pelanggan)
      const periode = tagihan ? `${bulanNama[tagihan.bulan - 1]} ${tagihan.tahun}` : 'Instalasi'
      return {
        'Tanggal Bayar': formatDateTime(item.tanggal_pembayaran),
        'Nama Pelanggan': pelanggan?.nama_lengkap ?? '',
        Email: pelanggan?.email ?? '',
        Periode: periode,
        'Jumlah Bayar': Number(item.jumlah_bayar ?? 0),
        'Status Verifikasi': item.status_verifikasi,
        'Status Tagihan': tagihan?.status_tagihan ?? instalasi?.status_tagihan ?? '',
        'Bukti Pembayaran': item.bukti_pembayaran ?? '',
        'Catatan Admin': item.catatan_admin ?? '',
      }
    })
  } else if (type === 'tiket') {
    headers = ['Tanggal', 'No. Tiket', 'Nama Pelanggan', 'Email', 'Subjek', 'Status']
    let query = admin
      .from('tiket_layanan')
      .select('*, pelanggan(nama_lengkap, email)')
      .order('created_at', { ascending: false })

    if (status === 'open') query = query.eq('status', 'open')
    if (status === 'closed') query = query.eq('status', 'closed')
    query = applyDateRange(query, 'created_at', month, year)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    rows = (data ?? []).map((item: any) => {
      const pelanggan = first(item.pelanggan)
      return {
        Tanggal: formatDateTime(item.created_at),
        'No. Tiket': item.nomor_tiket,
        'Nama Pelanggan': pelanggan?.nama_lengkap ?? '',
        Email: pelanggan?.email ?? '',
        Subjek: item.subjek,
        Status: item.status,
      }
    })
  } else {
    headers = ['Periode', 'Nama Pelanggan', 'Email', 'No HP', 'Jumlah Tagihan', 'Status', 'Jatuh Tempo', 'Tanggal Dibuat']
    let query = admin
      .from('tagihan')
      .select('*, pelanggan(nama_lengkap, email, no_hp)')
      .order('tahun', { ascending: false })
      .order('bulan', { ascending: false })

    if (month) query = query.eq('bulan', month)
    if (year) query = query.eq('tahun', year)
    if (isTagihanStatus(status)) query = query.eq('status_tagihan', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    rows = (data ?? []).map((item: any) => {
      const pelanggan = first(item.pelanggan)
      return {
        Periode: `${bulanNama[item.bulan - 1]} ${item.tahun}`,
        'Nama Pelanggan': pelanggan?.nama_lengkap ?? '',
        Email: pelanggan?.email ?? '',
        'No HP': pelanggan?.no_hp ?? '',
        'Jumlah Tagihan': Number(item.jumlah_tagihan ?? 0),
        Status: item.status_tagihan,
        'Jatuh Tempo': formatDate(item.jatuh_tempo),
        'Tanggal Dibuat': formatDateTime(item.created_at),
      }
    })
  }

  const file = await renderLaporanPdf({ type, headers, rows, month, year, status })
  const suffix = [
    year ? String(year) : null,
    month ? String(month).padStart(2, '0') : null,
    status && status !== 'semua' ? status : null,
  ].filter(Boolean).join('-')
  const filename = `laporan-${type}${suffix ? `-${suffix}` : ''}.pdf`

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
