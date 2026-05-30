# Route Aplikasi

## Ringkasan

Aplikasi memakai Next.js App Router. Route publik berada di `(landing)` dan `(public)`, route pelanggan berada di `/dashboard`, route admin berada di `/admin`, dan API internal berada di `/api`.

## Tujuan

Dokumentasi ini membantu developer menemukan halaman, komponen, action, dan data function yang terkait dengan setiap route.

## Struktur/Komponen terkait

### Route publik

| Route | File | Tujuan | Data/komponen terkait |
| --- | --- | --- | --- |
| `/` | `src/app/(landing)/page.tsx` | Landing page utama | `Hero`, `Banner`, `PackageSection`, `LocationChecker`, `SubscribeSteps`, `Footer`, `getLanding*`. |
| `/package` | `src/app/(landing)/package/page.tsx` | Daftar paket internet | `getLandingPackages`, `PackageCard`. |
| `/promo` | `src/app/(landing)/promo/page.tsx` | Daftar promo aktif | `getLandingPromos`. |
| `/faq` | `src/app/(landing)/faq/page.tsx` | FAQ pelanggan | `getLandingFaqs`. |
| `/about` | `src/app/(landing)/about/page.tsx` | Informasi perusahaan | Komponen landing statis. |
| `/login` | `src/app/(public)/login/page.tsx` | Login pelanggan/admin | `loginAction`, `logoutAction`. |
| `/register` | `src/app/(public)/register/page.tsx` | Registrasi pelanggan | `RegisterForm`, `registerAction`, `getPaketAktif`. |
| `/register/success` | `src/app/(public)/register/success/page.tsx` | Instruksi setelah registrasi | Halaman informasi. |
| `/auth/callback` | `src/app/auth/callback/route.ts` | Callback Supabase Auth | Membuat profil `pelanggan` setelah email dikonfirmasi. |
| `/auth/forgot-password` | `src/app/auth/forgot-password/page.tsx` | Permintaan reset password | Supabase Auth. |
| `/auth/set-password` | `src/app/auth/set-password/page.tsx` | Set password akun undangan | Supabase Auth. |

### Route pelanggan

| Route | File | Tujuan | Data/komponen terkait |
| --- | --- | --- | --- |
| `/dashboard` | `src/app/dashboard/page.tsx` | Ringkasan akun pelanggan | `DashboardOverviewContent`, query tagihan/pembayaran/jadwal. |
| `/dashboard/pending` | `src/app/dashboard/pending/page.tsx` | Status pelanggan pending | `PendingAccountCard`. |
| `/dashboard/nonaktif` | `src/app/dashboard/nonaktif/page.tsx` | Status pelanggan nonaktif | `InactiveAccountCard`. |
| `/dashboard/paket` | `src/app/dashboard/paket/page.tsx` | Paket aktif dan paket tersedia | `CurrentPackageSection`, `AvailablePackagesSection`. |
| `/dashboard/tagihan` | `src/app/dashboard/tagihan/page.tsx` | Daftar tagihan pelanggan | `BillingTableSection`, `BillingSummarySection`. |
| `/dashboard/tagihan/[id]` | `src/app/dashboard/tagihan/[id]/page.tsx` | Detail tagihan bulanan | `PaymentUploadForm`, `PaymentMethod`, `submitPembayaran`. |
| `/dashboard/tagihan-instalasi/[id]` | `src/app/dashboard/tagihan-instalasi/[id]/page.tsx` | Detail tagihan instalasi | `PaymentUploadFormInstalasi`, `submitPembayaranInstalasi`. |
| `/dashboard/riwayat` | `src/app/dashboard/riwayat/page.tsx` | Riwayat pembayaran | `PaymentHistorySection`. |
| `/dashboard/profil` | `src/app/dashboard/profil/page.tsx` | Profil pelanggan | `ProfilForm`, `updateProfilPelanggan`. |
| `/dashboard/tiket` | `src/app/dashboard/tiket/page.tsx` | Daftar tiket pelanggan | `CustomerTicketTable`, `CreateTicketForm`, `createTicketAction`. |
| `/dashboard/tiket/[id]` | `src/app/dashboard/tiket/[id]/page.tsx` | Detail tiket pelanggan | `CustomerTicketDetail`, `TicketReplyForm`, `sendCustomerTicketMessageAction`. |

### Route admin

| Route | File | Tujuan | Data/komponen terkait |
| --- | --- | --- | --- |
| `/admin` | `src/app/admin/page.tsx` | Dashboard admin | `DashboardOverviewContent`, statistik pelanggan, tagihan, tiket, jadwal. |
| `/admin/landing` | `src/app/admin/landing/page.tsx` | Manajemen konten landing | `LandingPageContent`, `LandingTabs`, `src/app/admin/landing/actions.ts`. |
| `/admin/pelanggan` | `src/app/admin/pelanggan/page.tsx` | Daftar pelanggan | `CustomerTableRow`, `SearchFilterBar`, `getPelangganList`. |
| `/admin/pelanggan/createPelanggan` | `src/app/admin/pelanggan/createPelanggan/page.tsx` | Tambah pelanggan oleh admin | `addPelangganByAdmin`. |
| `/admin/pelanggan/[id]` | `src/app/admin/pelanggan/[id]/page.tsx` | Detail pelanggan | Status, tagihan, pembayaran, jadwal terkait. |
| `/admin/pelanggan/[id]/updatePelanggan` | `src/app/admin/pelanggan/[id]/updatePelanggan/page.tsx` | Edit pelanggan | `updatePelangganByAdmin`. |
| `/admin/tagihan` | `src/app/admin/tagihan/page.tsx` | Daftar tagihan bulanan/instalasi | `BillingPageContent`, `getAllTagihan`, `getAllTagihanInstalasi`. |
| `/admin/tagihan/generate` | `src/app/admin/tagihan/generate/page.tsx` | Generate tagihan | `generateTagihanBulanan`, `generateTagihanInstalasiManual`. |
| `/admin/tagihan/[id]` | `src/app/admin/tagihan/[id]/page.tsx` | Detail tagihan bulanan | `getTagihanById`. |
| `/admin/tagihan/[id]/edit` | `src/app/admin/tagihan/[id]/edit/page.tsx` | Edit tagihan bulanan | `updateTagihanAction`. |
| `/admin/tagihan/instalasi/[id]/edit` | `src/app/admin/tagihan/instalasi/[id]/edit/page.tsx` | Edit tagihan instalasi | `updateTagihanInstalasiAction`. |
| `/admin/verifikasi` | `src/app/admin/verifikasi/page.tsx` | Verifikasi pembayaran | `VerificationPaymentPageContent`, `approvePayment`, `rejectPayment`. |
| `/admin/jadwal-instalasi` | `src/app/admin/jadwal-instalasi/page.tsx` | Jadwal layanan | `InstallationSchedulePageContent`, `updateJadwalInstalasiAction`, `createManualJadwalLayananAction`. |
| `/admin/tiket` | `src/app/admin/tiket/page.tsx` | Daftar tiket layanan | `AdminTicketTable`, `getAdminTickets`. |
| `/admin/tiket/[id]` | `src/app/admin/tiket/[id]/page.tsx` | Detail tiket admin | `AdminTicketDetail`, `sendAdminTicketMessageAction`, `scheduleTicketServiceAction`, `closeTicketAction`. |
| `/admin/laporan` | `src/app/admin/laporan/page.tsx` | Laporan operasional | `ReportPageContent`, `getLaporanOverview`, `getLaporanPreview`. |
| `/admin/laporan/export` | `src/app/admin/laporan/export/route.ts` | Export laporan | Route handler untuk output laporan. |

### Route API

| Route | File | Tujuan |
| --- | --- | --- |
| `/api/invoice/generate` | `src/app/api/invoice/generate/route.ts` | Membuat record invoice, render PDF, upload ke bucket `invoices`. |
| `/api/admin/paket` | `src/app/api/admin/paket/route.ts` | API admin untuk paket. |

## Alur kerja

```text
Request route
  -> middleware memeriksa auth untuk /dashboard dan /admin
  -> layout memeriksa role/status
  -> page mengambil data server-side
  -> Client Component memanggil server action bila ada mutasi
  -> server action revalidatePath agar UI mendapat data baru
```

## File yang terlibat

- `src/middleware.ts`
- `src/app/admin/layout.tsx`
- `src/app/dashboard/layout.tsx`
- `src/components/panel/layout/panelMenu.ts`
- `src/app/admin/actions.ts`
- `src/app/dashboard/actions.ts`
- `src/app/admin/tiket/actions.ts`
- `src/app/dashboard/tiket/actions.ts`

## Catatan penting

- Route `/admin` hanya untuk user dengan `user_metadata.role === 'admin'`.
- Route `/dashboard` membutuhkan akun yang sudah login dan email terkonfirmasi.
- Status pelanggan `pending` dan `nonaktif` diarahkan ke halaman khusus.
- Query string banyak dipakai untuk filter, pagination, tab, dan pesan sukses/error.
