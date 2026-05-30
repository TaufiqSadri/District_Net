# Gambaran Proyek

## Ringkasan

District Net adalah aplikasi web operasional untuk layanan internet lokal. Aplikasi ini menggabungkan halaman publik, registrasi pelanggan, dashboard pelanggan, dashboard admin, manajemen tagihan, verifikasi pembayaran, invoice, jadwal layanan, tiket layanan, dan notifikasi.

Kode menggunakan Next.js App Router, Supabase Auth, Supabase Database, Supabase Storage, dan server actions untuk mutasi data.

## Tujuan

Dokumentasi ini membantu developer memahami batas utama sistem:

- Halaman publik menampilkan paket, promo, area layanan, FAQ, dan banner.
- Pelanggan melakukan registrasi, melihat tagihan, mengunggah bukti pembayaran, mengelola profil, dan membuat tiket layanan.
- Admin mengelola pelanggan, tagihan, pembayaran, jadwal layanan, tiket, laporan, dan konten landing page.
- Sistem notifikasi dipakai untuk informasi jadwal layanan kepada pelanggan.

## Struktur/Komponen terkait

| Area | Lokasi utama | Keterangan |
| --- | --- | --- |
| App Router | `src/app` | Route publik, dashboard pelanggan, dashboard admin, route API, dan auth callback. |
| Data layer | `src/lib/data` | Fungsi baca/tulis Supabase untuk domain aplikasi. |
| Supabase client | `src/lib/supabase` | Client SSR, browser client, dan service role admin client. |
| Komponen panel | `src/components/panel` | Layout, topbar, sidebar, notifikasi, dan komponen shared dashboard. |
| Komponen tiket | `src/components/tickets` | UI percakapan tiket, form balasan, status, dan modal jadwal layanan. |
| Invoice | `src/lib/invoice`, `src/lib/pdf` | Pembuatan record invoice dan PDF invoice. |
| Tipe domain | `src/types/database.ts` | Tipe TypeScript untuk status, tabel penting, dan hasil list. |

## Alur kerja

```text
Pengunjung
  -> melihat landing page
  -> memilih paket
  -> register
  -> konfirmasi email Supabase
  -> dibuatkan row pelanggan dengan status pending

Admin
  -> approve pelanggan
  -> sistem membuat tagihan_instalasi
  -> pelanggan bayar instalasi
  -> admin verifikasi pembayaran
  -> sistem membuat jadwal_layanan instalasi
  -> jadwal selesai
  -> pelanggan menjadi aktif

Pelanggan aktif
  -> melihat tagihan bulanan
  -> mengirim bukti pembayaran
  -> membuat tiket layanan
  -> admin menjadwalkan pengecekan/perbaikan
  -> sistem membuat notifikasi jadwal
```

## File yang terlibat

- `src/app/(landing)/page.tsx`
- `src/app/(public)/register/actions.ts`
- `src/app/auth/callback/route.ts`
- `src/app/admin/actions.ts`
- `src/app/dashboard/actions.ts`
- `src/lib/data/pelanggan.ts`
- `src/lib/data/tagihan.ts`
- `src/lib/data/pembayaran.ts`
- `src/lib/data/jadwalInstalasi.ts`
- `src/lib/data/tiket.ts`
- `src/lib/data/notifikasi.ts`
- `src/lib/invoice/invoiceService.ts`
- `src/app/api/invoice/generate/route.ts`

## Teknologi

| Kategori | Teknologi |
| --- | --- |
| Framework | Next.js 14 App Router |
| UI | React 18, Tailwind CSS, lucide-react |
| Backend | Next.js server actions dan route API |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage untuk bukti pembayaran, banner, paket, dan invoice PDF |
| PDF | `@react-pdf/renderer` |
| Package manager | pnpm |

## Catatan penting

- `pelanggan.id` adalah ID profil pelanggan di tabel aplikasi.
- `pelanggan.user_id` adalah ID akun Supabase Auth.
- `notifikasi.user_id` adalah penerima utama notifikasi.
- Admin dikenali dari `user.user_metadata.role === 'admin'`.
- Service role Supabase dipakai di `createAdminClient` untuk operasi admin dan beberapa query lintas tabel.
