# Lelangin — Auction App (Frontend)

Prototype frontend untuk tugas kuliah (backend: Laravel, dikerjakan terpisah). Saat ini memakai **data dummy** dan **login dummy**, tanpa API.

## Menjalankan

```bash
bun install
bun run dev        # http://localhost:5173
bun run build      # build + typecheck
```

## Fitur

- 3 format lelang: **English** (proxy/auto-bid, anti-sniping, reserve, buy-now), **Dutch** (harga turun berkala), **Sealed-bid Vickrey** (pemenang bayar harga tertinggi ke-2)
- Simulasi real-time: bot penawar (`src/mocks/simulator.ts`) + event bus (`src/lib/realtime.ts`, nanti diganti Laravel Reverb / `@laravel/echo-react`)
- Bilingual **ID / EN** (react-i18next, key bertipe), dark mode
- Dashboard penjual + wizard buat lelang

## Skenario demo

1. Klik ↺ (Reset data demo) di navbar agar waktu lelang segar.
2. Masuk → quick login **Budi (Pembeli)**.
3. iPhone 16 Pro Max (English): pasang tawaran → langsung dibalas auto-bid Andi (proxy) → pasang auto-bid sendiri → menit terakhir: countdown diperpanjang (anti-sniping).
4. Lukisan Senja di Ubud (Dutch): harga turun tiap 20 detik → Beli.
5. Koin VOC (Sealed, selesai): hasil reveal Vickrey. MacBook (Sealed, berlangsung): kirim tawaran tertutup.
6. Ganti bahasa ID ↔ EN.
7. Logout → masuk sebagai **Sari (Penjual)** → Buat lelang.

## Struktur

```
src/
  routes/      halaman (TanStack Router file-based)
  features/    panel per format lelang
  components/  komponen UI bersama (HeroUI + Phosphor)
  services/    akses data — satu-satunya lapisan yang diganti saat API Laravel siap
  mocks/       seed data, db in-browser, simulator bot
  lib/         aturan lelang, format uang/waktu, realtime
  i18n/        locales en & id
```

## Konvensi commit

Conventional Commits (`feat`, `fix`, `refactor`, `chore`, `docs`, …) — divalidasi Husky + commitlint.
