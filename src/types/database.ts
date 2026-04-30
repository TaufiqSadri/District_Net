export type StatusLangganan = 'pending' | 'aktif' | 'nonaktif'
export type StatusTagihan = 'belum_bayar' | 'menunggu_verifikasi' | 'lunas'
export type StatusVerifikasi = 'menunggu' | 'diterima' | 'ditolak'

export interface PaketInternet {
  id: string
  nama_paket: string
  kecepatan_mbps: number
  harga: number
  deskripsi: string | null
  is_active: boolean
  created_at: string
}

export interface Pelanggan {
  id: string
  user_id: string
  nama_lengkap: string
  email: string
  no_hp: string
  alamat_pemasangan: string
  latitude: number | null
  longitude: number | null
  paket_id: string | null
  status_langganan: StatusLangganan
  tanggal_bergabung: string
  created_at: string
}

export interface RegisterFormData {
  nama_lengkap: string
  email: string
  no_hp: string
  alamat_pemasangan: string
  latitude: number | null
  longitude: number | null
  paket_id: string
}

export type PelangganWithPaket = Pelanggan & {
  paket_internet: PaketInternet | null
}

export interface TagihanRow {
  id: string
  pelanggan_id: string
  bulan: number
  tahun: number
  jumlah_tagihan: number
  status_tagihan: StatusTagihan
  created_at: string
}

export interface PembayaranRow {
  id: string
  tagihan_id: string
  jumlah_bayar: number
  tanggal_pembayaran: string
  status_verifikasi: StatusVerifikasi
  created_at: string
  catatan_admin?: string | null
}
