# Tiket Layanan

## Ringkasan

Tiket Layanan adalah sistem komunikasi pelanggan dan admin untuk keluhan, pengecekan, atau perbaikan layanan. Tiket menyimpan header di `tiket_layanan` dan percakapan di `tiket_pesan`.

## Tujuan

Dokumentasi ini menjelaskan konsep tiket, status tiket, perilaku pesan, integrasi jadwal layanan, notifikasi otomatis, dan batasan ketika tiket ditutup.

## Struktur/Komponen terkait

| Bagian | File | Peran |
| --- | --- | --- |
| Data tiket | `src/lib/data/tiket.ts` | CRUD tiket, pesan, close ticket, schedule service. |
| Action pelanggan | `src/app/dashboard/tiket/actions.ts` | Membuat tiket, mengirim pesan pelanggan, mark notification read lama. |
| Action admin | `src/app/admin/tiket/actions.ts` | Mengirim balasan admin, menutup tiket, menjadwalkan layanan. |
| Halaman pelanggan | `src/app/dashboard/tiket/page.tsx`, `src/app/dashboard/tiket/[id]/page.tsx` | List dan detail tiket pelanggan. |
| Halaman admin | `src/app/admin/tiket/page.tsx`, `src/app/admin/tiket/[id]/page.tsx` | List dan detail tiket admin. |
| Komponen tiket | `src/components/tickets/*` | UI pesan, status, reply form, modal jadwal, closed notice. |
| Jadwal layanan | `src/lib/data/jadwalInstalasi.ts` | List dan update jadwal layanan. |
| Notifikasi | `src/lib/data/notifikasi.ts` | Insert notifikasi jadwal dari tiket. |

## Alur kerja

### Membuat tiket

```text
pelanggan membuka /dashboard/tiket
  -> isi CreateTicketForm
  -> createTicketAction
  -> createTicket
  -> insert tiket_layanan
  -> insert tiket_pesan sebagai pesan awal
  -> redirect ke /dashboard/tiket/[id]
```

Fungsi utama:

- `createTicket`
- `createTicketAction`

### Membalas tiket

```text
pelanggan/admin membuka detail tiket
  -> TicketReplyForm
  -> sendCustomerTicketMessageAction atau sendAdminTicketMessageAction
  -> sendTicketMessage
  -> insert tiket_pesan
```

`sendTicketMessage` menolak pesan kosong dan menolak pesan baru jika `tiket_layanan.status !== 'open'`.

### Menutup tiket

```text
admin membuka detail tiket
  -> closeTicketAction
  -> closeTicket
  -> update tiket_layanan.status = closed
  -> set closed_at
  -> insert tiket_pesan system
```

Setelah tiket ditutup, pesan dan jadwal baru tidak boleh dibuat untuk tiket tersebut.

### Menjadwalkan layanan dari tiket

```text
admin membuka detail tiket
  -> TicketScheduleModal
  -> scheduleTicketServiceAction
  -> scheduleTicketService
  -> validasi tiket open
  -> insert jadwal_layanan
  -> insert tiket_pesan system
  -> createNotifications
```

Jenis jadwal dari tiket dibatasi ke:

- `pengecekan`
- `perbaikan`

Jenis `instalasi` dikelola melalui alur instalasi dan jadwal layanan admin.

## Relasi Tabel

```text
pelanggan.id
  -> tiket_layanan.pelanggan_id

tiket_layanan.id
  -> tiket_pesan.tiket_id
  -> jadwal_layanan.tiket_id

pelanggan.user_id
  -> notifikasi.user_id
```

## Status tiket

| Status | Makna |
| --- | --- |
| `open` | Tiket masih aktif, pesan dan jadwal layanan dapat dibuat. |
| `closed` | Tiket sudah ditutup, pesan dan jadwal baru ditolak. |

## File yang terlibat

- `src/lib/data/tiket.ts`
- `src/app/dashboard/tiket/actions.ts`
- `src/app/admin/tiket/actions.ts`
- `src/components/tickets/TicketReplyForm.tsx`
- `src/components/tickets/TicketMessageTimeline.tsx`
- `src/components/tickets/TicketMessageBubble.tsx`
- `src/components/tickets/TicketScheduleModal.tsx`
- `src/components/tickets/TicketStatusBadge.tsx`
- `src/components/tickets/TicketClosedNotice.tsx`
- `src/app/admin/tiket/sections/AdminTicketTable.tsx`
- `src/app/admin/tiket/sections/AdminTicketDetail.tsx`
- `src/app/dashboard/tiket/sections/CustomerTicketTable.tsx`
- `src/app/dashboard/tiket/sections/CustomerTicketDetail.tsx`
- `src/app/dashboard/tiket/sections/CreateTicketForm.tsx`

## Catatan penting

- `sender_type` pada `tiket_pesan` dapat bernilai `pelanggan`, `admin`, atau `system`.
- `sender_id` untuk pelanggan saat ini memakai `pelanggan.id`; untuk admin memakai `auth.users.id`; untuk system bernilai `null`.
- Nomor tiket dibuat oleh `generateNomorTiket` dengan pola `TKT-YYYYMMDD-XXXXXX`.
- `scheduleTicketService` membutuhkan `pelanggan.user_id` agar notifikasi masuk ke akun pelanggan yang benar.
- `attachMessageMeta` menambahkan latest message dan jumlah pesan untuk list tiket.
