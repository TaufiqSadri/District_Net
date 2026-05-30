# Catatan Pemeliharaan

## Ringkasan

Catatan ini mencatat area yang perlu perhatian saat maintenance. Fokusnya adalah risiko perubahan, potensi technical debt, dan saran perbaikan bertahap.

## Tujuan

Developer dapat menghindari perubahan berisiko, memahami area yang belum sepenuhnya rapi, dan menentukan prioritas refactor di masa depan.

## Struktur/Komponen terkait

| Area | File/folder | Catatan |
| --- | --- | --- |
| Action admin besar | `src/app/admin/actions.ts` | Memuat banyak domain: pelanggan, tagihan, verifikasi, jadwal. |
| Jadwal layanan | `src/lib/data/jadwalInstalasi.ts`, `src/app/admin/jadwal-instalasi` | Nama file masih memakai istilah instalasi, tetapi tabel mencakup semua `jadwal_layanan`. |
| Komponen jadwal duplikatif | `src/components/schedules`, `src/app/admin/jadwal-instalasi/sections/schedules` | Ada pola form/modal yang mirip. |
| Notifikasi | `src/lib/data/notifikasi.ts` | Perlu menjaga konsistensi `user_id` sebagai penerima utama. |
| Billing/payment | `src/lib/data/tagihan.ts`, `src/lib/data/pembayaran.ts` | Banyak efek status pelanggan dan jadwal instalasi. |
| Auth | `src/middleware.ts`, `src/app/auth/callback/route.ts` | Perlu hati-hati dengan redirect dan status email. |

## Alur kerja

```text
Sebelum mengubah fitur
  -> cari route terkait di docs/ROUTES.md
  -> baca data function di src/lib/data
  -> baca action terkait
  -> cek tabel dan status di docs/DATABASE_SCHEMA.md
  -> ubah minimal
  -> jalankan typecheck/build
```

## Area risiko

### `src/app/admin/actions.ts`

File ini cukup besar dan mencakup banyak domain. Risiko utama adalah perubahan kecil pada satu action dapat berdampak ke beberapa halaman admin.

Saran bertahap:

- Pisahkan action pelanggan ke `src/app/admin/pelanggan/actions.ts`.
- Pisahkan action tagihan ke `src/app/admin/tagihan/actions.ts`.
- Pisahkan action jadwal ke `src/app/admin/jadwal-instalasi/actions.ts`.

### Status pelanggan otomatis

`syncSuspendedPelangganStatuses` memperbarui status pelanggan berdasarkan tagihan belum lunas dan tanggal jatuh tempo. Fungsi ini dipanggil dari beberapa alur:

- List pelanggan.
- Approve/reject pembayaran.
- Update/delete tagihan.
- Login/dashboard pelanggan melalui `getCurrentPelanggan`.

Perubahan pada aturan status harus diuji pada pelanggan `aktif`, `ditangguhkan`, `proses_instalasi`, dan `nonaktif`.

### Jadwal layanan

Tabel `jadwal_layanan` sudah mencakup instalasi, pengecekan, dan perbaikan, tetapi beberapa nama file masih memakai `jadwalInstalasi`. Ini bukan bug, tetapi dapat membingungkan developer baru.

Saran:

- Dokumentasikan istilah ini di PR.
- Refactor nama file hanya jika dilakukan secara terencana dan terpisah dari perubahan fitur.

### Notifikasi

Risiko utama:

- Salah memakai `pelanggan.id` untuk `notifikasi.user_id`.
- Salah memakai kolom isi pesan. Schema memakai `isi`.
- Menampilkan reminder yang belum due.

Saran:

- Tambahkan test untuk `createNotifications`, `getNotifications`, dan `markNotificationAsRead`.
- Pertimbangkan utility builder untuk payload notifikasi per tipe.

### Invoice PDF

API `/api/invoice/generate` tetap mengembalikan invoice walaupun render/upload PDF gagal. Ini membantu UX, tetapi perlu monitoring error server.

Saran:

- Tambahkan retry upload PDF.
- Simpan status generasi PDF jika kebutuhan audit meningkat.

### Warning lint gambar

Build/lint saat ini menampilkan warning penggunaan `<img>` di beberapa komponen. Ini tidak menggagalkan build, tetapi dapat diperbaiki bertahap dengan `next/image` jika konfigurasi domain/storage sudah siap.

## File yang terlibat

- `src/app/admin/actions.ts`
- `src/lib/data/pelangganStatus.ts`
- `src/lib/data/notifikasi.ts`
- `src/lib/data/tagihan.ts`
- `src/lib/data/pembayaran.ts`
- `src/lib/data/jadwalInstalasi.ts`
- `src/lib/invoice/invoiceService.ts`
- `src/app/api/invoice/generate/route.ts`

## Catatan penting

- Tidak ada folder migration/schema lokal yang ditemukan. Schema operasional perlu dijaga melalui Supabase dashboard atau tooling eksternal.
- Beberapa query memakai service role untuk bypass RLS; pastikan proteksi route/action tetap benar.
- Dokumentasi ini harus diperbarui setiap kali ada tabel baru, route baru, atau perubahan status domain.
- Pisahkan refactor struktural dari bug fix agar risiko regresi lebih mudah diaudit.
