import { createAdminClient } from '@/lib/supabase/admin'
import { createNotifications } from '@/lib/data/notifikasi'
import type { JadwalInstalasi, JenisJadwalLayanan, StatusJadwalInstalasi } from '@/types/database'

type AdminClient = ReturnType<typeof createAdminClient>

export type ScheduleCustomerOption = {
  id: string
  nama_lengkap: string
  no_hp: string | null
}

export type JadwalInstalasiWithRelations = JadwalInstalasi & {
  pelanggan: {
    id: string
    nama_lengkap: string
    email: string
    no_hp: string
    alamat_pemasangan: string
    status_langganan: string
    paket_internet: {
      nama_paket: string
      kecepatan_mbps: number
    } | null
  } | null
  tagihan_instalasi: {
    id: string
    jumlah_tagihan: number
    status_tagihan: string
  } | null
  tiket_layanan: {
    id: string
    nomor_tiket: string
    subjek: string
  } | null
}

const jadwalSelect = `
  *,
  pelanggan:pelanggan_id (
    id,
    nama_lengkap,
    email,
    no_hp,
    alamat_pemasangan,
    status_langganan,
    paket_internet (
      nama_paket,
      kecepatan_mbps
    )
  ),
  tagihan_instalasi:tagihan_instalasi_id (
    id,
    jumlah_tagihan,
    status_tagihan
  ),
  tiket_layanan:tiket_id (
    id,
    nomor_tiket,
    subjek
  )
`

function formatScheduleDate(value: string | null) {
  if (!value) return 'waktu yang akan dikonfirmasi'
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function ensureJadwalInstalasi({
  admin,
  pelangganId,
  tagihanInstalasiId,
}: {
  admin: AdminClient
  pelangganId: string
  tagihanInstalasiId: string | null
}) {
  const { data: existing } = await admin
    .from('jadwal_layanan')
    .select('id')
    .eq('pelanggan_id', pelangganId)
    .eq('jenis_jadwal', 'instalasi')
    .neq('status', 'selesai')
    .neq('status', 'dibatalkan')
    .limit(1)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data, error } = await admin
    .from('jadwal_layanan')
    .insert({
      pelanggan_id: pelangganId,
      tagihan_instalasi_id: tagihanInstalasiId,
      jenis_jadwal: 'instalasi',
      status: 'menunggu_jadwal',
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id as string
}

export async function getJadwalInstalasiList({
  status = 'semua',
  jenis = 'semua',
  page = 1,
  pageSize = 20,
}: {
  status?: StatusJadwalInstalasi | 'semua'
  jenis?: JenisJadwalLayanan | 'semua'
  page?: number
  pageSize?: number
} = {}) {
  const admin = createAdminClient()
  let query = admin
    .from('jadwal_layanan')
    .select(jadwalSelect, { count: 'exact' })

  if (status !== 'semua') {
    query = query.eq('status', status)
  }
  if (jenis !== 'semua') {
    query = query.eq('jenis_jadwal', jenis)
  }

  query = query
    .order('tanggal_jadwal', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('getJadwalInstalasiList error:', error)
    return { data: [] as JadwalInstalasiWithRelations[], total: 0, page, pageSize, totalPages: 0 }
  }

  return {
    data: (data ?? []) as JadwalInstalasiWithRelations[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export async function getScheduleCustomerOptions(): Promise<ScheduleCustomerOption[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('pelanggan')
    .select('id, nama_lengkap, no_hp')
    .order('nama_lengkap', { ascending: true })

  if (error) {
    console.error('getScheduleCustomerOptions error:', error)
    return []
  }

  return (data ?? []) as ScheduleCustomerOption[]
}

export async function getLatestJadwalInstalasiForPelanggan(pelangganId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('jadwal_layanan')
    .select('*')
    .eq('pelanggan_id', pelangganId)
    .eq('jenis_jadwal', 'instalasi')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getLatestJadwalInstalasiForPelanggan error:', error)
    return null
  }

  return data as JadwalInstalasi | null
}

export async function updateJadwalInstalasiByAdmin(jadwalId: string, formData: FormData) {
  const admin = createAdminClient()

  const tanggalRaw = String(formData.get('tanggal_jadwal') ?? formData.get('tanggal_pemasangan') ?? '').trim()
  const jamRaw = String(formData.get('jam_jadwal') ?? formData.get('jam_pemasangan') ?? '').trim()
  const jenisJadwal = String(formData.get('jenis_jadwal') ?? 'instalasi') as JenisJadwalLayanan
  const teknisi = String(formData.get('teknisi') ?? '').trim()
  const status = String(formData.get('status') ?? 'menunggu_jadwal') as StatusJadwalInstalasi
  const catatan = String(formData.get('catatan') ?? '').trim()
  const catatanPelanggan = String(formData.get('catatan_pelanggan') ?? '').trim()
  const catatanInternal = String(formData.get('catatan_internal') ?? '').trim()

  const tanggalJadwal = tanggalRaw
    ? new Date(`${tanggalRaw}T${jamRaw || '09:00'}:00+07:00`).toISOString()
    : null

  const { data, error } = await admin
    .from('jadwal_layanan')
    .update({
      jenis_jadwal: jenisJadwal,
      tanggal_jadwal: tanggalJadwal,
      teknisi: teknisi || null,
      status,
      catatan: catatanPelanggan || catatan || null,
      catatan_pelanggan: catatanPelanggan || null,
      catatan_internal: catatanInternal || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jadwalId)
    .select('pelanggan_id, jenis_jadwal')
    .single()

  if (error) throw new Error(error.message)

  if (data?.pelanggan_id && data.jenis_jadwal === 'instalasi') {
    if (status === 'selesai') {
      await admin
        .from('pelanggan')
        .update({
          status_langganan: 'aktif',
          tanggal_bergabung: new Date().toISOString(),
        })
        .eq('id', data.pelanggan_id)
    } else if (status !== 'dibatalkan') {
      await admin
        .from('pelanggan')
        .update({ status_langganan: 'proses_instalasi' })
        .eq('id', data.pelanggan_id)
        .neq('status_langganan', 'nonaktif')
    }

    if (status === 'terjadwal' || status === 'dikerjakan') {
      try {
        const { data: pelanggan } = await admin
          .from('pelanggan')
          .select('user_id')
          .eq('id', data.pelanggan_id)
          .maybeSingle()

        if (pelanggan?.user_id) {
          const statusLabel = status === 'dikerjakan' ? 'sedang dikerjakan' : 'sudah dijadwalkan'
          await createNotifications(
            [
              {
                userId: pelanggan.user_id,
                title: status === 'dikerjakan' ? 'Instalasi Sedang Dikerjakan' : 'Instalasi Sudah Dijadwalkan',
                message: `Pemasangan layanan Anda ${statusLabel} pada ${formatScheduleDate(tanggalJadwal)}.`,
                type: 'jadwal',
                relatedId: jadwalId,
              },
            ],
            admin,
          )
        }
      } catch (notificationError) {
        console.error('updateJadwalInstalasiByAdmin notification error:', notificationError)
      }
    }
  }

}
