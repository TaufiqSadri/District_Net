# Notifikasi

## Ringkasan

Sistem notifikasi saat ini dipakai terutama untuk memberi tahu pelanggan tentang jadwal layanan dari tiket. Notifikasi dibaca di dashboard pelanggan melalui bell/topbar.

## Tujuan

Dokumentasi ini menjelaskan penggunaan tabel `notifikasi`, perbedaan `user_id` dan `pelanggan_id`, alur pembuatan notifikasi, unread count, mark as read, dan reminder H-3, H-1, Hari-H.

## Struktur/Komponen terkait

| Bagian | File | Peran |
| --- | --- | --- |
| Data notifikasi | `src/lib/data/notifikasi.ts` | Insert, fetch, count unread, mark as read. |
| Pembuatan dari tiket | `src/lib/data/tiket.ts` | `scheduleTicketService` membuat notifikasi jadwal. |
| Layout pelanggan | `src/app/dashboard/layout.tsx` | Mengambil notifikasi due dan unread count. |
| Action mark read | `src/app/dashboard/notification-actions.ts` | Menandai notifikasi dibaca. |
| Drawer UI | `src/components/panel/layout/PanelNotificationDrawer.tsx` | Menampilkan daftar dan tombol `Tandai dibaca`. |
| Topbar | `src/components/panel/layout/PanelTopbar.tsx` | Menampilkan badge unread. |

## Tabel `notifikasi`

| Kolom | Fungsi |
| --- | --- |
| `id` | Primary key. |
| `user_id` | ID akun auth penerima notifikasi. Ini identifier utama. |
| `judul` | Judul notifikasi. |
| `isi` | Isi pesan notifikasi. |
| `tipe` | Jenis notifikasi, contoh `jadwal`. |
| `related_id` | Referensi entitas terkait, saat ini dipakai untuk ID jadwal/tiket sesuai input. |
| `scheduled_at` | Waktu notifikasi boleh ditampilkan. |
| `sent_at` | Kolom tersedia di schema, belum menjadi syarat utama fetch. |
| `is_read` | Status dibaca. |
| `created_at` | Waktu dibuat. |
| `pelanggan_id` | Kolom ada di schema, tetapi bukan identifier utama untuk fetch notifikasi. |

## Alur kerja

### Pembuatan notifikasi dari jadwal tiket

```text
admin menjadwalkan layanan dari tiket
  -> scheduleTicketServiceAction
  -> scheduleTicketService
  -> ambil tiket dan relasi pelanggan.user_id
  -> insert jadwal_layanan
  -> insert tiket_pesan system
  -> createNotifications
  -> row notifikasi dibuat untuk notifikasi langsung dan reminder
```

### Reminder jadwal

`scheduleTicketService` membuat daftar notifikasi:

| Waktu | Kondisi |
| --- | --- |
| Langsung | Selalu dibuat dengan `scheduled_at = now()`. |
| H-3 | Dibuat jika waktunya tidak berada di masa lalu. |
| H-1 | Dibuat jika waktunya tidak berada di masa lalu. |
| Hari-H | Dibuat jika waktu jadwal tidak berada di masa lalu. |

### Fetch notifikasi

```text
DashboardLayout
  -> getNotifications()
  -> auth.getUser()
  -> query notifikasi
     where user_id = user.id
     and scheduled_at <= now()
  -> render PanelNotificationDrawer
```

### Unread count

```text
getUnreadNotificationCount()
  -> auth.getUser()
  -> count notifikasi
     where user_id = user.id
     and scheduled_at <= now()
     and is_read = false
  -> dikirim ke PanelTopbar
```

### Mark as read

```text
PanelNotificationDrawer
  -> form markNotificationAsReadAction
  -> markNotificationAsRead(notificationId)
  -> update notifikasi
     set is_read = true
     where id = notificationId
     and user_id = current user id
```

## File yang terlibat

- `src/lib/data/notifikasi.ts`
- `src/lib/data/tiket.ts`
- `src/app/admin/tiket/actions.ts`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/notification-actions.ts`
- `src/components/panel/layout/PanelNotificationDrawer.tsx`
- `src/components/panel/layout/PanelTopbar.tsx`

## Catatan penting

- Jangan query `notifikasi.pelanggan_id` untuk notifikasi akun pelanggan.
- Untuk pelanggan, isi `notifikasi.user_id` dari `pelanggan.user_id`.
- Kolom isi pesan yang benar adalah `notifikasi.isi`.
- `related_id` saat ini dipakai sebagai referensi generik; saat membuat notifikasi dari jadwal, isi dengan ID `jadwal_layanan` bila memungkinkan.
- Admin bell di `PanelTopbar` masih berupa tombol icon sederhana dan belum memakai data notifikasi admin.
- Dashboard pelanggan juga menambahkan notifikasi sintetis untuk tagihan dan status instalasi, selain data dari tabel `notifikasi`.
