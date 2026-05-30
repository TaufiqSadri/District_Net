# Fitur Aplikasi

## Ringkasan

Aplikasi memuat fitur publik, pelanggan, dan admin. Setiap fitur terhubung ke tabel Supabase dan server action/data function yang spesifik.

## Tujuan

File ini memberikan peta fitur tingkat menengah agar developer dapat memahami tujuan fitur, alur pengguna, file utama, tabel terkait, dan batasan yang perlu diperhatikan.

## Struktur/Komponen terkait

### Landing page

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Menampilkan identitas layanan, paket internet, promo, area layanan, FAQ, dan banner. |
| Alur kerja | Pengunjung membuka `/`, data aktif diambil dari tabel landing, lalu ditampilkan oleh komponen landing. |
| File utama | `src/app/(landing)/page.tsx`, `src/app/(landing)/components/*`, `src/lib/data/landing.ts`. |
| Tabel terkait | `paket_internet`, `promo`, `faq`, `area_layanan`, `iklan`. |
| Fungsi penting | `getLandingPackages`, `getLandingPromos`, `getLandingFaqs`, `getLandingAreas`, `getLandingIklans`. |
| Batasan | Data landing memakai `unstable_cache`; perubahan admin perlu `revalidateTag`/`revalidatePath`. |

### Landing page management

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Admin mengelola paket, promo, FAQ, area layanan, dan banner. |
| Alur kerja | Admin membuka `/admin/landing`, memilih tab, lalu menjalankan action CRUD. |
| File utama | `src/app/admin/landing/page.tsx`, `src/app/admin/landing/actions.ts`, `src/app/admin/landing/sections/*`. |
| Tabel terkait | `paket_internet`, `promo`, `faq`, `area_layanan`, `iklan`. |
| Fungsi penting | `addPaket`, `updatePaket`, `togglePaketStatus`, `createPromo`, `updatePromo`, `createFaq`, `createAreaLayanan`, `createIklan`. |
| Batasan | Penghapusan gambar paket/banner mencoba menghapus file storage jika URL cocok dengan bucket yang diharapkan. |

### Admin dashboard

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Memberikan ringkasan operasional admin. |
| Alur kerja | `src/app/admin/layout.tsx` memvalidasi role admin, mengambil badge count tiket dan pembayaran, lalu render panel. |
| File utama | `src/app/admin/page.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/sections/*`. |
| Tabel terkait | `pelanggan`, `tagihan`, `tagihan_instalasi`, `pembayaran`, `jadwal_layanan`, `tiket_layanan`. |
| Fungsi penting | `getPelangganStats`, `getTagihanStats`, `getTagihanInstalasiStats`, `getTicketStats`. |
| Batasan | Badge admin di-cache 30 detik melalui `unstable_cache`. |

### Customer dashboard

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Pelanggan melihat status layanan, tagihan, pembayaran, paket, jadwal, dan tiket. |
| Alur kerja | `getCurrentPelanggan` mencari profil dari `user_id`, lalu layout dan halaman dashboard mengambil data terkait. |
| File utama | `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/lib/data/dashboardPelanggan.ts`. |
| Tabel terkait | `pelanggan`, `paket_internet`, `tagihan`, `tagihan_instalasi`, `pembayaran`, `jadwal_layanan`, `notifikasi`. |
| Fungsi penting | `getCurrentPelanggan`, `getDashboardPelangganData`, `requireActivePelanggan`. |
| Batasan | Status `pending` dan `nonaktif` diarahkan ke halaman khusus. Status `ditangguhkan` masih dapat melihat tagihan. |

### Customer management

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Admin mengelola data dan status pelanggan. |
| Alur kerja | Admin melihat list pelanggan, filter/search, tambah pelanggan, edit, approve, suspend, activate, deactivate, atau delete. |
| File utama | `src/app/admin/pelanggan/*`, `src/app/admin/actions.ts`, `src/lib/data/pelanggan.ts`. |
| Tabel terkait | `pelanggan`, `paket_internet`, `tagihan`, `tagihan_instalasi`, `pembayaran`, `jadwal_layanan`. |
| Fungsi penting | `getPelangganList`, `addPelangganByAdmin`, `updatePelangganByAdmin`, `approvePelanggan`, `deletePelangganByAdmin`. |
| Batasan | `deletePelangganByAdmin` juga menghapus akun Supabase Auth terkait lewat service role. |

### Billing/tagihan

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Mengelola tagihan bulanan dan tagihan instalasi. |
| Alur kerja | Admin generate tagihan, pelanggan membayar, admin dapat edit status/jumlah/jatuh tempo. |
| File utama | `src/app/admin/tagihan/*`, `src/lib/data/tagihan.ts`, `src/app/admin/actions.ts`. |
| Tabel terkait | `tagihan`, `tagihan_instalasi`, `pelanggan`, `paket_internet`. |
| Fungsi penting | `generateTagihanBulanan`, `generateTagihanInstalasiManual`, `getAllTagihan`, `getAllTagihanInstalasi`, `markAsPaid`, `markAsPaidInstalasi`. |
| Batasan | `overdue` dihitung dari `jatuh_tempo`, bukan disimpan di database. Bulan pertama pelanggan aktif dilewati saat generate tagihan bulanan. |

### Payment verification

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Admin memverifikasi bukti pembayaran pelanggan. |
| Alur kerja | Pelanggan upload bukti, row `pembayaran` dibuat dengan `status_verifikasi = menunggu`, admin menerima atau menolak. |
| File utama | `src/app/admin/verifikasi/*`, `src/lib/data/pembayaran.ts`, `src/app/dashboard/actions.ts`. |
| Tabel terkait | `pembayaran`, `tagihan`, `tagihan_instalasi`, `pelanggan`. |
| Fungsi penting | `submitPembayaran`, `submitPembayaranInstalasi`, `getPembayaranList`, `approvePayment`, `rejectPayment`. |
| Batasan | Pembayaran aktif dengan status `menunggu` atau `diterima` mencegah upload ulang untuk tagihan yang sama. |

### Invoice generation/download

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Membuat invoice dan PDF untuk pembayaran yang sudah diterima. |
| Alur kerja | Admin memanggil API `/api/invoice/generate`, record invoice dibuat jika belum ada, PDF dirender dan diupload ke bucket `invoices`. |
| File utama | `src/app/api/invoice/generate/route.ts`, `src/lib/invoice/invoiceService.ts`, `src/lib/pdf/renderInvoicePdf.tsx`, `src/components/InvoiceButton.tsx`. |
| Tabel terkait | `invoice`, `pembayaran`, `tagihan`, `tagihan_instalasi`, `pelanggan`. |
| Fungsi penting | `generateInvoice`, `getInvoiceDetail`, `updateInvoicePdfUrl`, `renderInvoicePdf`. |
| Batasan | Invoice hanya dibuat untuk pembayaran dengan `status_verifikasi = diterima`. |

### Tiket Layanan

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Pelanggan dan admin berkomunikasi tentang gangguan atau permintaan layanan. |
| Alur kerja | Pelanggan membuat tiket, pesan awal masuk, admin/pelanggan membalas, admin bisa menutup tiket atau menjadwalkan layanan. |
| File utama | `src/lib/data/tiket.ts`, `src/app/dashboard/tiket/*`, `src/app/admin/tiket/*`, `src/components/tickets/*`. |
| Tabel terkait | `tiket_layanan`, `tiket_pesan`, `pelanggan`, `jadwal_layanan`, `notifikasi`. |
| Fungsi penting | `createTicket`, `getCustomerTickets`, `getAdminTickets`, `getTicketDetail`, `sendTicketMessage`, `closeTicket`, `scheduleTicketService`. |
| Batasan | Tiket `closed` tidak dapat menerima pesan atau jadwal baru. |

### Jadwal Layanan

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Admin mengatur jadwal instalasi, pengecekan, dan perbaikan. |
| Alur kerja | Jadwal instalasi dibuat setelah pembayaran instalasi diterima; jadwal pengecekan/perbaikan bisa dibuat dari tiket. |
| File utama | `src/lib/data/jadwalInstalasi.ts`, `src/app/admin/jadwal-instalasi/*`, `src/components/schedules/*`. |
| Tabel terkait | `jadwal_layanan`, `pelanggan`, `tagihan_instalasi`, `tiket_layanan`. |
| Fungsi penting | `ensureJadwalInstalasi`, `getJadwalInstalasiList`, `updateJadwalInstalasiByAdmin`, `createManualJadwalLayananAction`. |
| Batasan | Nama file masih memakai istilah instalasi, tetapi tabel dan domain sekarang mencakup semua `jadwal_layanan`. |

### Notification system

| Aspek | Detail |
| --- | --- |
| Tujuan Fitur | Memberikan notifikasi layanan kepada akun pelanggan. |
| Alur kerja | Jadwal layanan dari tiket membuat notifikasi langsung dan reminder H-3, H-1, Hari-H. Dashboard mengambil notifikasi due dan unread count. |
| File utama | `src/lib/data/notifikasi.ts`, `src/app/dashboard/layout.tsx`, `src/components/panel/layout/PanelNotificationDrawer.tsx`. |
| Tabel terkait | `notifikasi`, `pelanggan`, `jadwal_layanan`, `tiket_layanan`. |
| Fungsi penting | `createNotifications`, `getNotifications`, `getUnreadNotificationCount`, `markNotificationAsRead`. |
| Batasan | Penerima utama adalah `notifikasi.user_id`, bukan `pelanggan_id`. |

## Alur kerja

```text
Fitur UI
  -> page/layout mengambil data awal
  -> Client Component mengirim form/action
  -> server action melakukan validasi
  -> data function menjalankan query Supabase
  -> revalidatePath atau redirect memperbarui tampilan
```

## File yang terlibat

- `src/app/(landing)`
- `src/app/admin`
- `src/app/dashboard`
- `src/lib/data`
- `src/components/panel`
- `src/components/tickets`
- `src/lib/invoice`
- `src/lib/pdf`

## Catatan penting

- Banyak fitur memakai service role melalui `createAdminClient`; pastikan action yang memanggilnya sudah melakukan validasi role atau ownership.
- Search pelanggan memakai beberapa normalisasi ID seperti `DN` + 6 karakter awal UUID tanpa dash.
- Beberapa halaman memiliki status UI turunan seperti `overdue` yang tidak identik dengan nilai database.
