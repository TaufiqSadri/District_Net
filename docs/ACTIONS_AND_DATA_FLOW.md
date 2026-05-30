# Action dan Alur Data

## Ringkasan

Aplikasi memakai kombinasi Server Component, Client Component, server actions, route API, dan fungsi data layer. Query langsung biasanya ada di page/layout server-side atau di `src/lib/data`, sedangkan mutasi biasanya berada di file `actions.ts`.

## Tujuan

Dokumentasi ini menjelaskan pola data fetching, mutasi, validasi, dan penggunaan Supabase agar developer dapat menambah fitur tanpa mencampur tanggung jawab.

## Struktur/Komponen terkait

| Jenis | Lokasi | Contoh |
| --- | --- | --- |
| Server Component page/layout | `src/app/**/page.tsx`, `src/app/**/layout.tsx` | `src/app/admin/layout.tsx`, `src/app/dashboard/layout.tsx`. |
| Server action umum admin | `src/app/admin/actions.ts` | `approvePelanggan`, `generateTagihanBulanan`, `updateJadwalInstalasiAction`. |
| Server action domain tiket | `src/app/admin/tiket/actions.ts`, `src/app/dashboard/tiket/actions.ts` | `scheduleTicketServiceAction`, `createTicketAction`. |
| Server action landing | `src/app/admin/landing/actions.ts` | `addPaket`, `createIklan`, `deleteFaq`. |
| Data layer | `src/lib/data/*.ts` | `getPelangganList`, `getAllTagihan`, `approvePayment`, `scheduleTicketService`. |
| Route API | `src/app/api/**/route.ts` | `src/app/api/invoice/generate/route.ts`. |

## Alur kerja

### Pembacaan data

```text
Page/layout server-side
  -> panggil data function
  -> data function membuat Supabase query
  -> hasil dikirim sebagai props ke komponen
```

Contoh:

- `src/app/admin/tagihan/page.tsx` memakai data function dari `src/lib/data/tagihan.ts`.
- `src/app/dashboard/layout.tsx` mengambil `getNotifications` dan `getUnreadNotificationCount`.
- `src/app/admin/layout.tsx` menghitung badge tiket dan pembayaran menunggu.

### Mutasi data

```text
Form di Client/Server Component
  -> server action
  -> validasi input dasar
  -> panggil data function atau Supabase langsung
  -> revalidatePath/revalidateTag
  -> redirect atau return object status
```

Contoh:

- `submitPembayaran` membuat row `pembayaran` dan mengubah `tagihan.status_tagihan`.
- `approvePayment` mengubah `pembayaran.status_verifikasi`, melunasi tagihan, dan menyinkronkan status pelanggan.
- `scheduleTicketServiceAction` memanggil `scheduleTicketService` untuk membuat `jadwal_layanan`, pesan sistem, dan notifikasi.

## Validasi

| Area | Lokasi validasi |
| --- | --- |
| Login | `src/app/(public)/login/actions.ts` |
| Register | `src/app/(public)/register/actions.ts` |
| Upload pembayaran | `src/app/dashboard/actions.ts` |
| CRUD pelanggan admin | `src/app/admin/actions.ts` |
| Tiket layanan | `src/lib/data/tiket.ts`, `src/app/admin/tiket/actions.ts`, `src/app/dashboard/tiket/actions.ts` |
| Jadwal layanan | `src/lib/data/jadwalInstalasi.ts`, `src/app/admin/actions.ts` |
| Invoice API | `src/app/api/invoice/generate/route.ts` |

## Penggunaan Supabase

| Client | File | Penggunaan |
| --- | --- | --- |
| SSR user client | `src/lib/supabase/server.ts` | Membaca session user, query yang mengikuti cookie auth. |
| Browser client | `src/lib/supabase/client.ts` | Dipakai Client Component bila perlu akses browser Supabase. |
| Admin client | `src/lib/supabase/admin.ts` | Service role untuk operasi admin, bypass RLS, Auth Admin API, dan Storage. |

## File yang terlibat

- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/admin.ts`
- `src/app/admin/actions.ts`
- `src/app/dashboard/actions.ts`
- `src/app/admin/landing/actions.ts`
- `src/app/admin/tiket/actions.ts`
- `src/app/dashboard/tiket/actions.ts`
- `src/lib/data/*.ts`

## Catatan penting

- Server action yang memakai `createAdminClient` harus memastikan user yang memanggil memiliki hak akses yang sesuai.
- `redirect` dari `next/navigation` digunakan sebagai kontrol alur setelah mutasi sukses/gagal.
- `revalidatePath` dipakai luas untuk menyegarkan halaman dashboard dan admin setelah mutasi.
- `revalidateTag` dipakai untuk cache landing page seperti `landing-packages`, `landing-promos`, `landing-faqs`, `landing-areas`, dan `landing-iklans`.
- Route API invoice memakai handler route karena perlu menerima JSON body, membuat PDF, dan upload ke Storage.
