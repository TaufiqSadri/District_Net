# Panduan Pengembangan

## Ringkasan

Panduan ini menjelaskan cara menjalankan aplikasi, variabel lingkungan, perintah umum, dan pola penambahan fitur baru berdasarkan struktur proyek saat ini.

## Tujuan

Developer baru dapat menjalankan proyek lokal, memahami lokasi perubahan, dan menambah fitur dengan pola yang konsisten.

## Struktur/Komponen terkait

| Area | File/folder |
| --- | --- |
| Konfigurasi package | `package.json`, `pnpm-lock.yaml` |
| Konfigurasi Next.js | `next.config.mjs` |
| Konfigurasi TypeScript | `tsconfig.json` |
| Konfigurasi Tailwind | `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css` |
| Supabase | `src/lib/supabase/*` |
| Route aplikasi | `src/app` |
| Data layer | `src/lib/data` |
| Komponen reusable | `src/components` |

## Langkah Menjalankan Aplikasi

1. Install dependency:

```bash
pnpm install
```

2. Siapkan `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

3. Jalankan development server:

```bash
pnpm dev
```

4. Buka aplikasi:

```text
http://localhost:3000
```

## Perintah umum

| Perintah | Fungsi |
| --- | --- |
| `pnpm dev` | Menjalankan Next.js development server. |
| `pnpm build` | Build production dan validasi type Next.js. |
| `pnpm start` | Menjalankan hasil build. |
| `pnpm lint` | Menjalankan lint Next.js. |
| `pnpm exec tsc --noEmit` | Menjalankan TypeScript check tanpa output build. |

## Alur kerja

### Menambah halaman admin baru

1. Buat folder route di `src/app/admin/<nama-fitur>/page.tsx`.
2. Gunakan data function di `src/lib/data/<domain>.ts` bila fitur butuh query.
3. Tambahkan menu ke `src/components/panel/layout/panelMenu.ts`.
4. Jika ada mutasi, buat server action di folder route atau gunakan `src/app/admin/actions.ts` jika benar-benar umum.
5. Panggil `revalidatePath` untuk route yang terdampak.

### Menambah halaman tabel dengan search/filter/pagination

Pola yang sudah ada:

- Data function menerima parameter `search`, `status`, `sort`, `page`, `pageSize`.
- Return shape berisi `data`, `total`, `page`, `pageSize`, `totalPages`.
- UI memakai komponen seperti `PanelPagination`, `SearchFilterBar`, dan table row per domain.

Contoh file:

- `src/lib/data/pelanggan.ts`
- `src/lib/data/tagihan.ts`
- `src/lib/data/pembayaran.ts`
- `src/lib/data/tiket.ts`

### Menambah server action

1. Tambahkan `'use server'` di file action.
2. Ambil user dengan `createClient` bila perlu auth user.
3. Validasi input dari `FormData`.
4. Panggil data function atau Supabase query.
5. Gunakan `revalidatePath`/`revalidateTag`.
6. Return `{ success, message }` untuk action modal/client, atau `redirect` untuk form halaman penuh.

### Menambah komponen reusable

- Komponen dashboard umum masuk ke `src/components/panel/shared`.
- Komponen layout dashboard masuk ke `src/components/panel/layout`.
- Komponen domain spesifik boleh berada di folder route `sections` atau di `src/components/<domain>` bila dipakai lintas area.

### Menambah tabel Supabase baru

1. Tambahkan tipe domain di `src/types/database.ts`.
2. Tambahkan data function di `src/lib/data/<domain>.ts`.
3. Tambahkan route/page yang memakai data function.
4. Jika butuh admin operation, pastikan action dilindungi role admin.
5. Dokumentasikan tabel di `docs/DATABASE_SCHEMA.md`.

## Variabel Lingkungan

| Variabel | Wajib | Digunakan oleh |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | Semua Supabase client. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | SSR/browser client. |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya | `createAdminClient`, server-side only. |
| `NEXT_PUBLIC_SITE_URL` | Disarankan | Redirect register, invite user, link callback. |

## File yang terlibat

- `package.json`
- `.env.local`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/admin.ts`
- `src/components/panel/layout/panelMenu.ts`
- `src/types/database.ts`

## Catatan penting

- Jangan expose `SUPABASE_SERVICE_ROLE_KEY` ke Client Component.
- Hindari query service role langsung dari file client.
- Jalankan `pnpm build` sebelum deploy karena Next.js juga memvalidasi tipe route.
- Saat mengubah konten landing yang dicache, pastikan `revalidateTag` sesuai tag cache.
- Jika menjalankan `pnpm exec tsc --noEmit` gagal karena `.next/types` belum ada, jalankan `pnpm build` terlebih dahulu atau bersihkan `.next` sesuai kebutuhan.
