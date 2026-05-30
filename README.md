# District Net

District Net adalah aplikasi web operasional untuk layanan internet. Aplikasi ini mencakup landing page publik, registrasi pelanggan, dashboard pelanggan, dashboard admin, manajemen tagihan, verifikasi pembayaran, invoice, jadwal layanan, tiket layanan, dan notifikasi.

## Teknologi

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Storage
- `@react-pdf/renderer` untuk invoice PDF
- pnpm

## Langkah Menjalankan Aplikasi

Install dependency:

```bash
pnpm install
```

Buat file `.env.local` dengan variabel berikut:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

Jalankan development server:

```bash
pnpm dev
```

Buka aplikasi di:

```text
http://localhost:3000
```

## Perintah Utama

| Perintah | Fungsi |
| --- | --- |
| `pnpm dev` | Menjalankan development server. |
| `pnpm build` | Membuat build production dan menjalankan validasi Next.js. |
| `pnpm start` | Menjalankan hasil build production. |
| `pnpm lint` | Menjalankan lint Next.js. |
| `pnpm exec tsc --noEmit` | Menjalankan TypeScript check. |

## Variabel Lingkungan

| Variabel | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key untuk Supabase client. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key untuk operasi server-side admin. Jangan expose ke client. |
| `NEXT_PUBLIC_SITE_URL` | URL aplikasi untuk callback auth dan invite user. |

## Dokumentasi Teknis

Dokumentasi lengkap tersedia di folder `docs/`:

- [Gambaran Proyek](docs/PROJECT_OVERVIEW.md)
- [Struktur Folder](docs/FOLDER_STRUCTURE.md)
- [Route Aplikasi](docs/ROUTES.md)
- [Skema Database](docs/DATABASE_SCHEMA.md)
- [Fitur Aplikasi](docs/FEATURES.md)
- [Action dan Alur Data](docs/ACTIONS_AND_DATA_FLOW.md)
- [Autentikasi dan Peran](docs/AUTH_AND_ROLES.md)
- [Notifikasi](docs/NOTIFICATIONS.md)
- [Tiket Layanan](docs/TICKET_SERVICE.md)
- [Panduan Pengembangan](docs/DEVELOPMENT_GUIDE.md)
- [Catatan Pemeliharaan](docs/MAINTENANCE_NOTES.md)

## Catatan Pengembangan

- Gunakan `src/lib/data` untuk logic akses data.
- Gunakan server action untuk mutasi data dari form atau komponen interaktif.
- Admin dikenali dari `user.user_metadata.role === 'admin'`.
- Relasi akun pelanggan memakai `pelanggan.user_id = auth.users.id`.
- Notifikasi pelanggan memakai `notifikasi.user_id` sebagai penerima utama.
