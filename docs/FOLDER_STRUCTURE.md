# Struktur Folder

## Ringkasan

Struktur proyek mengikuti pola Next.js App Router. Route berada di `src/app`, logic domain berada di `src/lib`, komponen reusable berada di `src/components`, dan tipe domain berada di `src/types`.

## Tujuan

File ini menjelaskan lokasi penambahan fitur baru, pemisahan tanggung jawab antar folder, dan pola penamaan yang terlihat dari codebase.

## Struktur/Komponen terkait

| Folder | Isi | Catatan pengembangan |
| --- | --- | --- |
| `src/app` | Route, layout, server actions per area, dan route API | Gunakan route group seperti `(landing)` dan `(public)` bila route tidak perlu tampil di URL. |
| `src/app/admin` | Dashboard admin, action admin, halaman pelanggan, tagihan, verifikasi, jadwal, tiket, laporan, landing manager | Gunakan `admin/layout.tsx` untuk proteksi role admin. |
| `src/app/dashboard` | Dashboard pelanggan, tagihan, paket, riwayat, profil, tiket, status pending/nonaktif | Gunakan `dashboard/layout.tsx` untuk panel pelanggan dan notifikasi. |
| `src/app/(landing)` | Landing page publik, promo, paket, FAQ, about | Data publik diambil lewat `src/lib/data/landing.ts`. |
| `src/app/(public)` | Login, register, register success | Auth action berada di folder route masing-masing. |
| `src/components/panel` | Komponen dashboard admin dan pelanggan | Berisi layout, sidebar, topbar, breadcrumb, drawer notifikasi, dan komponen shared. |
| `src/components/tickets` | Komponen UI tiket layanan | Dipakai oleh halaman tiket admin dan pelanggan. |
| `src/components/schedules` | Komponen form/modal jadwal reusable | Ada juga varian di `src/app/admin/jadwal-instalasi/sections/schedules`. |
| `src/lib/data` | Data access dan logic domain | Tempat utama fungsi Supabase untuk pelanggan, tagihan, pembayaran, jadwal, tiket, notifikasi, laporan, landing. |
| `src/lib/supabase` | Inisialisasi Supabase client | Pisahkan SSR client, browser client, dan admin client. |
| `src/lib/invoice` | Logic invoice | Membuat dan mengambil invoice. |
| `src/lib/pdf` | Render PDF invoice | Dipakai route API invoice. |
| `src/types` | Tipe TypeScript domain | `database.ts` memuat status enum dan interface utama. |
| `public` | Asset statis | Logo, gambar landing, QRIS, favicon. |
| `docs` | Dokumentasi teknis | Semua isi dokumentasi ditulis dalam Bahasa Indonesia. |

## Alur kerja

```text
Route di src/app
  -> memanggil komponen UI
  -> memanggil server action atau data function
  -> data function memakai Supabase client
  -> response dirender kembali oleh halaman/layout
```

## File yang terlibat

- `src/app/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/app/dashboard/layout.tsx`
- `src/components/panel/layout/PanelLayout.tsx`
- `src/components/panel/layout/panelMenu.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/admin.ts`

## Konvensi yang terlihat

| Pola | Contoh |
| --- | --- |
| Server action route-scoped | `src/app/admin/tiket/actions.ts`, `src/app/dashboard/tiket/actions.ts` |
| Data function domain | `src/lib/data/tiket.ts`, `src/lib/data/tagihan.ts` |
| Section component | `src/app/admin/tagihan/sections/BillingPageContent.tsx` |
| Shared panel component | `src/components/panel/shared/PanelPagination.tsx` |
| Type domain | `StatusLangganan`, `StatusTagihan`, `TicketStatus` di `src/types/database.ts` |

## Catatan penting

- Jangan menaruh logic database langsung di Client Component.
- Mutasi data sebaiknya lewat server action atau fungsi di `src/lib/data`.
- Jika menambah halaman admin, tambahkan menu di `src/components/panel/layout/panelMenu.ts`.
- Jika menambah status domain baru, perbarui `src/types/database.ts` dan helper label/status terkait.
