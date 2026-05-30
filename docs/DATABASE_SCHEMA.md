# Skema Database

## Ringkasan

Database menggunakan Supabase PostgreSQL. Metadata tabel yang digunakan aplikasi terbaca dari Supabase dan tipe aplikasi dipetakan di `src/types/database.ts`.

## Tujuan

Dokumentasi ini menjelaskan tabel utama, field penting, relasi, dan nilai status yang dipakai oleh logic aplikasi.

## Struktur/Komponen terkait

### Tabel utama

| Tabel | Tujuan | Field penting |
| --- | --- | --- |
| `pelanggan` | Profil pelanggan aplikasi | `id`, `user_id`, `nama_lengkap`, `email`, `no_hp`, `alamat_pemasangan`, `paket_id`, `status_langganan`, `tanggal_bergabung`. |
| `paket_internet` | Paket internet | `nama_paket`, `kecepatan_mbps`, `harga`, `deskripsi`, `is_active`, `benefits`, `image_url`. |
| `tagihan` | Tagihan bulanan | `pelanggan_id`, `bulan`, `tahun`, `jumlah_tagihan`, `status_tagihan`, `jatuh_tempo`. |
| `tagihan_instalasi` | Tagihan instalasi | `pelanggan_id`, `jumlah_tagihan`, `status_tagihan`, `jatuh_tempo`, `bukti_pembayaran`. |
| `pembayaran` | Bukti dan status verifikasi pembayaran | `tagihan_id`, `tagihan_instalasi_id`, `jumlah_bayar`, `bukti_pembayaran`, `status_verifikasi`, `catatan_admin`. |
| `jadwal_layanan` | Jadwal instalasi, pengecekan, dan perbaikan | `pelanggan_id`, `tagihan_instalasi_id`, `tiket_id`, `jenis_jadwal`, `tanggal_jadwal`, `teknisi`, `status`, `catatan_pelanggan`, `catatan_internal`. |
| `tiket_layanan` | Tiket layanan pelanggan | `pelanggan_id`, `nomor_tiket`, `subjek`, `status`, `closed_at`. |
| `tiket_pesan` | Pesan dalam tiket | `tiket_id`, `sender_type`, `sender_id`, `pesan`. |
| `notifikasi` | Notifikasi akun pengguna | `user_id`, `judul`, `isi`, `tipe`, `related_id`, `scheduled_at`, `sent_at`, `is_read`, `pelanggan_id`. |
| `invoice` | Record invoice pembayaran | `pembayaran_id`, `invoice_number`, `invoice_type`, `pdf_url`. |
| `promo` | Konten promo landing page | `title`, `description`, `tag`, `is_active`, `urutan`. |
| `faq` | FAQ landing page | `question`, `answer`, `urutan`. |
| `area_layanan` | Area cakupan layanan | `kecamatan`, `nagari`. |
| `iklan` | Banner/iklan landing page | `judul`, `deskripsi`, `image_url`, `link_url`, `is_active`, `urutan`. |

## Relasi Tabel

```text
auth.users.id
  -> pelanggan.user_id

pelanggan.id
  -> tagihan.pelanggan_id
  -> tagihan_instalasi.pelanggan_id
  -> jadwal_layanan.pelanggan_id
  -> tiket_layanan.pelanggan_id

paket_internet.id
  -> pelanggan.paket_id

tagihan.id
  -> pembayaran.tagihan_id

tagihan_instalasi.id
  -> pembayaran.tagihan_instalasi_id
  -> jadwal_layanan.tagihan_instalasi_id

tiket_layanan.id
  -> tiket_pesan.tiket_id
  -> jadwal_layanan.tiket_id

pembayaran.id
  -> invoice.pembayaran_id

notifikasi.user_id
  -> auth.users.id
```

## Alur kerja

### Registrasi pelanggan

```text
Supabase Auth signUp
  -> metadata pendaftaran disimpan di auth user
  -> /auth/callback membuat row pelanggan
  -> pelanggan.status_langganan = pending
```

### Pembayaran instalasi

```text
admin approve pelanggan
  -> pelanggan.status_langganan = ditangguhkan
  -> tagihan_instalasi dibuat
  -> pelanggan upload bukti
  -> pembayaran dibuat dengan status_verifikasi = menunggu
  -> admin approve
  -> tagihan_instalasi.status_tagihan = lunas
  -> jadwal_layanan jenis instalasi dibuat atau dipastikan ada
```

### Tiket layanan

```text
pelanggan membuat tiket_layanan
  -> pesan awal masuk ke tiket_pesan
  -> admin dapat membalas atau menutup tiket
  -> admin dapat membuat jadwal_layanan jenis pengecekan/perbaikan
  -> notifikasi dibuat untuk pelanggan
```

## Nilai status

| Tipe | Nilai |
| --- | --- |
| `StatusLangganan` | `pending`, `aktif`, `ditangguhkan`, `proses_instalasi`, `nonaktif` |
| `StatusTagihan` | `belum_bayar`, `menunggu_verifikasi`, `lunas` |
| `TagihanStatus` UI admin | `belum_bayar`, `menunggu_verifikasi`, `lunas`, `overdue` |
| `StatusVerifikasi` | `menunggu`, `diterima`, `ditolak` |
| `StatusJadwalInstalasi` | `menunggu_jadwal`, `terjadwal`, `dikerjakan`, `selesai`, `dibatalkan` |
| `JenisJadwalLayanan` | `instalasi`, `pengecekan`, `perbaikan` |
| `TicketStatus` | `open`, `closed` |
| `TicketSenderType` | `pelanggan`, `admin`, `system` |

## File yang terlibat

- `src/types/database.ts`
- `src/lib/data/pelanggan.ts`
- `src/lib/data/tagihan.ts`
- `src/lib/data/pembayaran.ts`
- `src/lib/data/jadwalInstalasi.ts`
- `src/lib/data/tiket.ts`
- `src/lib/data/notifikasi.ts`
- `src/lib/invoice/invoiceService.ts`

## Catatan penting

- Tabel jadwal bernama `jadwal_layanan`, bukan `jadwal_instalasi`, walaupun beberapa nama file masih memakai istilah instalasi.
- Tabel tiket bernama `tiket_layanan` dan pesan tiket berada di `tiket_pesan`.
- `notifikasi.pelanggan_id` ada di metadata tabel, tetapi alur utama aplikasi menggunakan `notifikasi.user_id` sebagai penerima.
- `notifikasi.isi` adalah kolom isi pesan notifikasi. Kode mapper masih toleran membaca `pesan` untuk kompatibilitas data lama.
- Status `overdue` bukan nilai database `status_tagihan`; nilai ini dihitung di `src/lib/data/tagihan.ts`.
