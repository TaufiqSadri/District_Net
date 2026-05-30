# Autentikasi dan Peran

## Ringkasan

Autentikasi memakai Supabase Auth. Pemisahan admin dan pelanggan dilakukan dengan `user.user_metadata.role`. Profil pelanggan aplikasi disimpan di tabel `pelanggan` dan dihubungkan ke akun auth melalui `pelanggan.user_id`.

## Tujuan

File ini menjelaskan alur login, registrasi, callback email, proteksi route, dan relasi antara akun auth dengan data pelanggan.

## Struktur/Komponen terkait

| Bagian | File | Peran |
| --- | --- | --- |
| Middleware auth | `src/middleware.ts` | Melindungi `/dashboard` dan `/admin`, redirect user login/register. |
| Login | `src/app/(public)/login/actions.ts` | `loginAction` dan `logoutAction`. |
| Register | `src/app/(public)/register/actions.ts` | `registerAction` membuat akun Supabase Auth. |
| Auth callback | `src/app/auth/callback/route.ts` | Exchange code, validasi email, membuat row `pelanggan`. |
| Admin layout | `src/app/admin/layout.tsx` | Guard tambahan untuk role admin. |
| Dashboard layout | `src/app/dashboard/layout.tsx` | Guard profil pelanggan dan layout panel. |
| Current pelanggan | `src/lib/data/pelanggan.ts` | `getCurrentPelanggan` mencari `pelanggan` berdasarkan `user_id`. |

## Alur kerja

### Registrasi pelanggan publik

```text
/register
  -> registerAction
  -> supabase.auth.signUp
  -> metadata pelanggan disimpan di auth user
  -> user konfirmasi email
  -> /auth/callback
  -> row pelanggan dibuat dengan status pending
  -> user diarahkan sesuai status
```

### Login

```text
/login
  -> loginAction
  -> supabase.auth.signInWithPassword
  -> validasi email_confirmed_at
  -> role admin diarahkan ke /admin
  -> pelanggan dicek di tabel pelanggan
  -> status pending/nonaktif/ditangguhkan diarahkan ke route khusus
```

### Admin invite pelanggan

```text
admin tambah pelanggan
  -> addPelangganByAdmin
  -> admin.auth.admin.inviteUserByEmail
  -> user_metadata.role = pelanggan
  -> row pelanggan dibuat
  -> tagihan_instalasi dibuat
```

## Peran Pengguna

| Peran | Sumber | Akses |
| --- | --- | --- |
| Admin | `user.user_metadata.role === 'admin'` | `/admin`, API invoice generate, action admin. |
| Pelanggan | Auth user dengan row `pelanggan` | `/dashboard`, tagihan, profil, tiket, riwayat. |
| Pengunjung | Tidak login | Landing page, login, register, FAQ, promo, paket. |

## Relasi akun dan pelanggan

```text
auth.users.id = pelanggan.user_id
pelanggan.id = ID profil/domain pelanggan
```

Gunakan `pelanggan.user_id` ketika logic membutuhkan akun auth, misalnya penerima `notifikasi.user_id`. Gunakan `pelanggan.id` untuk relasi domain seperti `tagihan.pelanggan_id`, `jadwal_layanan.pelanggan_id`, dan `tiket_layanan.pelanggan_id`.

## File yang terlibat

- `src/middleware.ts`
- `src/app/(public)/login/actions.ts`
- `src/app/(public)/register/actions.ts`
- `src/app/auth/callback/route.ts`
- `src/app/auth/set-password/page.tsx`
- `src/app/auth/forgot-password/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/dashboard/layout.tsx`
- `src/lib/data/pelanggan.ts`

## Catatan penting

- Middleware tidak melakukan query database untuk status pelanggan; status dicek di page/layout/data function.
- Email harus terkonfirmasi sebelum akses `/dashboard` atau `/admin`.
- Redirect parameter di `/login?redirect=` divalidasi agar non-admin tidak diarahkan ke `/admin`.
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai server-side melalui `createAdminClient`.
- Data registrasi awal disimpan sementara di `user_metadata`, lalu dipindahkan ke tabel `pelanggan` di `/auth/callback`.
