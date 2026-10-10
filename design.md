# GOOGLE STITCH WIREFRAME PROMPT SPECIFICATION (COMPLETE SITEMAP V5)
**Project:** dbb_luxe — Luxury Jastip & Ready Stock Concierge  
**Design Standard:** High-End Editorial Luxury, Spacious Minimalism, Zero Clutter  
**File Target:** Google Stitch AI / Figma Wireframe Generator  
**Total Screens Covered:** 28 Complete Screens (Zero Missed Pages)

---

## 1. DESIGN PHILOSOPHY & ANTI-CLUTTER CONSTRAINTS (STRICT RULES)

> [!IMPORTANT]
> **NEGATIVE PROMPTS & ANTI-CLUTTER RULES (MANDATORY):**
> 1. **ZERO OFFLINE / PHYSICAL STORE REFERENCES:** Dilarang keras memunculkan teks: *"toko fisik"*, *"toko offline"*, *"gudang offline"*, *"warehouse fisik"*, *"Pasar Baru"*, *"ambil di toko"*, *"self-pickup"*, atau *"meja kasir"*. dbb_luxe beroperasi **100% Online Concierge**. Seluruh pesanan dikemas rapi dan dikirimkan langsung oleh admin melalui kurir ke alamat pengiriman pelanggan.
> 2. **NO BUSY BACKGROUNDS:** Banner utama dan kartu produk dilarang menggunakan foto latar belakang pemandangan kota/lampu neon yang ramai di belakang teks. Background banner wajib berupa kartu solid/gradasi gelap elegan (*dark luxury espresso card*) dengan kontras tipografi tinggi.
> 3. **STRICT 4-COLOR PALETTE TOKENS:**
>    - Primary (`#EFE1C6` - Soft Warm Cream)
>    - Secondary (`#D8B978` - Champagne Gold)
>    - Accent CTA (`#8C6D3F` - Deep Cognac Bronze)
>    - Neutral Base (`#FFFBF2` - Warm Porcelain Canvas)
>    - Dark Hero Surface (`#1C140C` - Deep Espresso Card)
> 4. **AIRY LAYOUT & AMPLE BREATHING ROOM:**
>    - Jarak vertikal antar-seksi minimal `64px` s/d `88px`.
>    - Padding dalam card minimal `24px` (desktop: `36px` s/d `44px`).
>    - Tidak ada elemen yang tumpang tindih (*zero overlapping elements*).
> 5. **SINGLE PRIMARY CTA RULE:** Hanya satu tombol beraksen solid (`#8C6D3F`) per area pandang; aksi lainnya wajib berupa *outline* atau *ghost button*.
> 6. **TYPOGRAPHY HIERARCHY:** Editorial Serif (*Cormorant Garamond* / *Playfair Display*) untuk Display & Judul, Clean Sans-Serif (*Plus Jakarta Sans* / *Inter*) untuk UI & Body. Judul produk dibatasi maksimal 2 baris teks.

---

## 2. DESIGN TOKENS DEFINITION

```json
{
  "brand": {
    "name": "dbb_luxe",
    "sub_label": "JASTIP & READY STOCK",
    "business_model": "100% Online Luxury Jastip & Ready Stock Concierge"
  },
  "colors": {
    "page_background": "#FFFBF2",
    "surface_white": "#FFFFFF",
    "surface_dark": "#1C140C",
    "brand_primary": "#EFE1C6",
    "brand_secondary": "#D8B978",
    "brand_accent": "#8C6D3F",
    "text_headline": "#1C140C",
    "text_muted": "#6E6254",
    "border_gold": "rgba(216, 185, 120, 0.4)",
    "border_cream": "#EFE1C6"
  },
  "typography": {
    "display_font": "Cormorant Garamond, Playfair Display, serif",
    "body_font": "Plus Jakarta Sans, Inter, sans-serif"
  },
  "radii": {
    "card": "16px",
    "pill": "999px",
    "control": "8px"
  }
}
```

---

## 3. PROMPT LENGKAP GOOGLE STITCH: SELURUH 28 SCREEN (ZERO MISSED PAGES)

Salin blok instruksi di bawah ini ke dalam Google Stitch:

```text
Generate a cohesive, ultra-luxurious, and airy design system and wireframe prototype for "dbb_luxe" (100% Online Luxury Jastip & Ready Stock Concierge).

GLOBAL RULES & NEGATIVE CONSTRAINTS:
- 100% Online: Strictly NO mentions of "toko fisik", "offline store", "gudang offline", "Pasar Baru", or "in-store pickup". All orders are delivered via courier directly to the customer's shipping address.
- Palette: Porcelain canvas (#FFFBF2), Warm cream (#EFE1C6), Champagne gold (#D8B978), Deep cognac bronze (#8C6D3F) for primary CTAs, Deep espresso black (#1C140C) for dark hero containers.
- Typography: Display Serif (Cormorant Garamond / Playfair Display) for headlines; Clean Sans (Plus Jakarta Sans / Inter) for UI and body text.
- Anti-Clutter: Spacious margins (64px-88px vertical gaps), 1px champagne gold borders, soft elevation, maximum 1 primary solid CTA per viewport.

================================================================================
PART A: GUEST & PUBLIC SCREENS
================================================================================

[SCREEN 1] BERANDA / HOMEPAGE (/)
- Persistent Header: Top announcement strip "DBB LUXURY BRANDED PARTNER • 100% PRODUK ORIGINAL • PENGIRIMAN AMAN KE SELURUH INDONESIA" (dark espresso with champagne gold text).
- Sticky Navbar: Logo "dbb_luxe" with subtext "JASTIP & READY STOCK", links (Beranda, Ready Stock, Jadwal Jastip, Request, Cara Order), search bar, Wishlist badge, Notification badge, Cart trigger, "Masuk / Daftar" button.
- Top Hero — Active Jastip Banner: Solid luxury espresso gradient card (linear-gradient 135deg, #1C140C 0%, #2A1F16 50%, #1A130C 100%) with 1px champagne gold border (#D8B978). NO background photo.
  * Status dot + "Jadwal Jastip Sedang Buka (Open PO)" + Country tag "🇯🇵 Jepang".
  * Headline: "Japan Autumn Special Trip 2026" (crisp white serif), subtitle: "Tokyo & Osaka (Don Quijote, Tokyo Station, Ginza)".
  * Dates: Close PO: 20 Okt 2026 • Estimasi Tiba di Jakarta: 2 Nov 2026.
  * Countdown Card: Box counters (Hari, Jam, Menit) + CTA: "Buka Jadwal & Titip Barang →" (#8C6D3F bronze).
- Hero Carousel (Directly beneath banner): 2-Column slide card (Text left, Curated media right) showcasing Japan, Korea, Bangkok, and Custom Request drops. Sleek arrow buttons & elongated dot indicators.
- Ready Stock Showcase: Header with pill "READY STOCK • SIAP KIRIM KE SELURUH INDONESIA", category filter pills, 4-column product grid (photo with zoom, origin flag, "Stok Tersedia: X pcs", price in Rupiah, wishlist heart, "Detail" & "Beli Langsung" buttons).
- Custom Request CTA Banner: Full-width warm cream card "Barang yang Anda cari belum ada di katalog? Ajukan Request Titip Barang →".
- Global Footer: 4 columns (Brand story, Explorasi, Bantuan & Syarat, Admin link) + Copyright.

[SCREEN 2] KATALOG READY STOCK (/ready)
- Header with search input, category pills (Semua, Skincare, Snack, Fashion, Tas), and sorting dropdown (Terbaru, Harga Terendah, Stok Terbanyak).
- Notice pill: "Stok Tersedia di Warehouse Jakarta • Langsung dikemas & dikirim ke alamat Anda".
- 4-Column responsive product grid with Quick View modal trigger, stock count, and price in bronze #8C6D3F.
- Empty state with "Reset Filter" button.

[SCREEN 3] DETAIL PRODUK READY STOCK (/ready/[slug])
- Breadcrumb: Beranda > Ready Stock > [Kategori] > [Nama Produk].
- Left: Multi-angle product photo gallery with thumbnail selector.
- Right:
  * Origin flag & "Ready Stock" badge.
  * Product Title (editorial serif) & Stock availability: "Stok Tersedia di Warehouse: X unit".
  * Price display in IDR.
  * Variant selector (Size / Shade) & Quantity stepper (+ / -).
  * Trust Cards: "Pengiriman Cepat & Aman (Kurir Ekspedisi Langsung ke Alamat)" + "100% Produk Original".
  * CTA Row: "Beli Sekarang", "Tambah ke Keranjang", "Chat Tanya Produk".
  * Accordion tabs: Deskripsi Lengkap, Jaminan Keaslian, Kebijakan Pengiriman.

[SCREEN 4] DIREKTORI JADWAL JASTIP TRIPS (/jastip)
- Filter tabs: "Semua Trip", "Sedang Buka (Open PO)", "Segera Tutup", "Arsip / Selesai".
- Trip Cards Grid:
  * Destination country flag & curated cover photo.
  * PO Status badge (Open / Closed / Purchasing / Arrived).
  * Schedule: Tanggal Berangkat, Batas Order (Close PO), Estimasi Tiba di Jakarta.
  * Baggage Luggage Quota progress bar (e.g. "75% Terisi — Sisa 5 slot koper").
  * Foreign currency note & applied exchange rate (kurs).
  * CTA: "Lihat Katalog Trip & Titip Barang →".

[SCREEN 5] DETAIL TRIP & KATALOG PRODUK JASTIP (/jastip/[trip-slug])
- Trip Header Banner: Country flag, shopping itinerary (e.g. Ginza, Don Quijote, Tokyo Station), shopping rules, terms of service.
- Quota Tracker Card & Live countdown until Close PO.
- Curated Product Grid for this specific trip: Product cards displaying IDR price (calculated from foreign price + exchange rate + jastip fee) and quota limit per item.

[SCREEN 6] DETAIL PRODUK JASTIP (/jastip/[trip-slug]/[slug])
- Origin store reference (e.g. "Don Quijote Shinjuku") & original currency price (e.g. "¥2,500 JPY").
- Selling price breakdown in IDR: (Harga Asal × Kurs + Jastip Fee).
- Estimated arrival timeline.
- Payment Scheme selector: "Bayar Lunas (100%)" vs "Down Payment (DP 50%)".
- Maximum order quantity stepper.
- CTA: "Titip Produk Ini (PO)" -> Leads to 2-stage checkout.

[SCREEN 7] AUTENTIKASI MASUK & DAFTAR (/login & /register & Auth Modal)
- Minimalist luxury modal & page with tabbed toggle:
  * Tab "Masuk Akun": Input Email & Password, link "Lupa Password", tombol "Masuk ke Akun".
  * Tab "Daftar Akun": Input Nama Lengkap, Email, Nomor Handphone / WhatsApp, Password, Konfirmasi Password (tanpa OTP), tombol "Daftar Akun Baru".
- Benefit strip: Simpan wishlist, pantau status verifikasi order, dan konsultasi chat.

[SCREEN 8] PANDUAN CARA ORDER 2-TAHAP (/cara-order)
- Visual 5-step horizontal/vertical roadmap explaining the 2-stage verification workflow:
  1. Pilih Jalur Belanja (Ready Stock atau Jastip PO).
  2. Checkout & Tunggu Persetujuan Admin (Status: pending_approval — admin cek ketersediaan stok & kuota koper).
  3. Pesanan Disetujui: Transfer Manual & Upload Bukti (Status: pending_payment — batas bayar 24 jam).
  4. Pantau Tracking & Bukti Pembelian Luar Negeri (Admin upload bukti struk resmi toko LN).
  5. Pengiriman Barang Langsung ke Alamat Anda (Dikemas aman dan dikirim kurir ekspedisi ke rumah).

[SCREEN 9] PERTANYAAN UMUM / FAQ (/faq)
- Clean accordion list:
  * Perbedaan Ready Stock vs Jastip.
  * Sistem pembayaran transfer manual dengan 3-digit kode unik.
  * Ketentuan DP 50% untuk barang jastip.
  * Garansi 100% full refund jika barang habis di toko luar negeri.
  * Pengiriman pesanan online langsung ke alamat customer (tanpa toko fisik).

[SCREEN 10] SYARAT & KETENTUAN (/syarat-ketentuan)
- Editorial legal terms: Layanan jastip resmi, batas transfer 24 jam setelah di-ACC, kebijakan pembatalan & refund 100%, serta kebijakan pengiriman ekspedisi ke seluruh Indonesia.

================================================================================
PART B: CUSTOMER AUTHENTICATED SCREENS
================================================================================

[SCREEN 11] WISHLIST / FAVORIT SAYA (/wishlist)
- Header with item counter: "Wishlist Saya (X barang tersimpan)".
- Grid of favorited items with badges distinguishing "Ready Stock" vs "Jastip".
- Action controls per item: "Pindahkan ke Checkout", "Hapus", and "Tanya Admin di Chat".
- Empty state with button "Jelajahi Katalog".

[SCREEN 12] FORM REQUEST TITIP PRODUK KUSTOM (/request)
- Split 2-column layout:
  * Left (Form Request): Nama Produk, Upload Foto Referensi (drag-and-drop zone), Link Toko / Web Luar Negeri (opsional), Pilihan Negara/Trip Tujuan, Estimasi Budget, Catatan Khusus -> Submit Button.
  * Right (Riwayat Request Saya): List of submitted requests with status pills ("Menunggu Review", "Diberikan Penawaran / Quoted", "Diterima Jadi Order", "Ditolak").
  * If Quoted: Displays admin's quoted price in IDR, quote countdown timer, and button "Setujui & Buat Order".

[SCREEN 13] RUANG LIVE CHAT CUSTOMER 1-ON-1 (/chat)
- General 1-on-1 chat room between customer and dbb_luxe admin concierge.
- Header showing online status dot and response time.
- Chat message history with warm gold bubbles (customer) and white/espresso bubbles (admin).
- Embedded interactive product card preview when inquiring about specific items.
- Image attachment button, textarea input, and bronze send button (#8C6D3F).

[SCREEN 14] CHECKOUT 2-TAHAP (/checkout)
- Notice Banner: "Alur Pemesanan 2-Tahap: Pesanan akan diperiksa ketersediaannya terlebih dahulu oleh Admin dbb_luxe (cek kuota bagasi & stok). Setelah di-ACC, pembayaran transfer manual dapat dilakukan."
- Section 1: Data Pemesan (Nama Lengkap, No. WhatsApp Aktif).
- Section 2: Alamat Pengiriman Lengkap (Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos). Note: "dbb_luxe beroperasi 100% online. Pesanan dikemas rapi dan dikirim langsung ke alamat Anda."
- Section 3: Skema Pembayaran ("Bayar Lunas 100%" atau "DP 50% Khusus Jastip").
- Section 4: Ringkasan Tagihan & Kode Unik 3 Digit (Subtotal + Kode Unik = Total Tagihan).
- Primary CTA: "Ajukan Pesanan (Menunggu Persetujuan Admin) →".

[SCREEN 15] RIWAYAT PESANAN CUSTOMER (/orders)
- Filter Tabs: "Semua", "Menunggu ACC", "Menunggu Pembayaran", "Sedang Dibelikan", "Sedang Dikirim", "Selesai", "Ditolak".
- Order Cards List: Order Code (e.g. #JST-20261002-001), Order Date, Items preview, Total amount, Status badge, and Button "Lihat Detail & Tracking →".

[SCREEN 16] DETAIL & TRACKING PESANAN (/orders/[kode-order])
- 8-Stage Interactive Status Timeline Stepper:
  1. Menunggu Persetujuan Admin (pending_approval)
  2. Menunggu Pembayaran (pending_payment)
  3. Bukti Transfer Diupload (payment_uploaded)
  4. Pembayaran Terverifikasi (verified)
  5. Sedang Dibelikan di LN / Siap Dikemas (purchasing / ready)
  6. Barang Tiba di Indonesia (arrived)
  7. Sedang Dikemas & Dikirim (ready_pickup/shipping)
  8. Pesanan Selesai / Terkirim (completed)
- Conditional Alert Box:
  * If pending_approval: Penjelasan proses peninjauan ketersediaan oleh admin.
  * If rejected: Kotak merah berisi alasan penolakan dari admin.
  * If pending_payment: Alert emas + Countdown batas bayar 24 jam + Tombol "Bayar Sekarang & Upload Bukti".
- Destination Shipping Address Card displaying customer's registered delivery address.
- Items breakdown table & payment status summary.

[SCREEN 17] UPLOAD BUKTI TRANSFER PEMBAYARAN (/orders/[kode-order]/bayar)
- Unlocked ONLY when order status is pending_payment (approved by admin).
- 24-Hour Countdown Timer Box.
- Official Bank Account Details (BCA / Mandiri) with one-click copy buttons and QRIS.
- Exact Transfer Amount box with prominent 3-digit unique code.
- File upload dropzone with receipt image preview (.jpg, .png, .pdf).
- Inputs for Sender Bank Name and Account Holder Name.
- Submit Button: "Kirim Bukti Pembayaran" -> Status changes to payment_uploaded.

[SCREEN 18] PUSAT NOTIFIKASI (/notifikasi)
- Header with "Tandai Semua Dibaca" button.
- Notification cards with icons: Perubahan Status Order (ACC, Lunas, Dikirim), Penawaran Quote Request, Pengumuman Open PO Trip baru. Direct clickable links to order/trip pages.

[SCREEN 19] PENGATURAN AKUN PROFIL (/akun)
- Tab 1 "Profil Saya": Form edit Nama Lengkap, Alamat Email, Nomor WhatsApp/HP, tombol simpan.
- Tab 2 "Keamanan": Form Ganti Password (Password Lama, Password Baru, Konfirmasi Password).

================================================================================
PART C: ADMIN BACKOFFICE PORTAL (/admin/*)
================================================================================

[SCREEN 20] DASHBOARD RINGKASAN ADMIN (/admin)
- Persistent Admin Sidebar: Dashboard, Kelola Order, Kelola Trip, Kelola Produk, Live Chat, Request Masuk, Pelanggan, Pengaturan Toko, Audit Log.
- KPI Stat Cards: "Perlu Persetujuan ACC", "Menunggu Verifikasi Bayar", "Chat Belum Dibaca", "Trip Aktif", "Omzet Bulan Ini".
- Table: 5 Pesanan terbaru yang memerlukan tindakan (ACC / Verifikasi bukti bayar).

[SCREEN 21] KELOLA ORDER & VERIFIKASI PEMBAYARAN (/admin/order)
- Filter Tabs: Semua, Perlu ACC, Menunggu Bayar, Cek Pembayaran, Dalam Proses, Selesai, Ditolak.
- Action Modal 1 (Review & ACC Order):
  * Detail item, ketersediaan stok ready / sisa kuota koper luar negeri, dan alamat pengiriman customer.
  * Opsi input ongkos kirim manual (opsional).
  * Buttons: "✓ Setujui Pesanan (ACC)" (mengaktifkan countdown 24 jam) ATAU "✕ Tolak Pesanan" (wajib memilih/menulis alasan penolakan).
- Action Modal 2 (Verifikasi Pembayaran):
  * Preview foto bukti transfer bank (struk / m-banking), cocokkan nominal dan kode unik transfer 3 digit.
  * Buttons: "✓ Konfirmasi Pembayaran Sah (Lunas)" ATAU "Tolak Bukti Transfer".
- Advance Order Buttons: "Tandai Barang Tiba di Jakarta" -> "Siapkan & Kirim ke Alamat" -> "✓ Tandai Telah Terkirim / Selesai".

[SCREEN 22] KELOLA JADWAL TRIP JASTIP (/admin/trip & /admin/trip/[id])
- /admin/trip: Tabel daftar trip jastip (Negara, Tanggal Berangkat, Close PO, Kuota Koper terisi/total, Kurs, Status) + Tombol "Tambah Trip Baru" (Modal CRUD).
- /admin/trip/[id]: Detail trip operasional:
  * Alokasi produk trip.
  * Daftar pesanan customer yang terhubung ke trip ini.
  * Tombol "Ekspor Daftar Belanja (Packing & Shopping Sheet)" untuk panduan belanja admin saat di luar negeri.

[SCREEN 23] KELOLA PRODUK READY & JASTIP (/admin/produk)
- Tab Switcher: "Produk Ready Stock" vs "Produk Jastip PO".
- Table with photo, product name, category, price in IDR, stock quantity (ready) or quota (jastip), status active/inactive.
- Modal Tambah/Edit Produk: Upload gambar, nama produk, kategori, harga jual rupiah, kalkulator kurs (harga valuta asing × kurs + fee), dan stok tersedia.

[SCREEN 24] INBOX LIVE CHAT ADMIN (/admin/chat)
- 3-Column Split Interface:
  * Left: Daftar percakapan customer dengan badge pesan belum dibaca.
  * Middle: Timeline percakapan aktif, input pesan balasan, lampirkan gambar, dan tombol kirim kartu rekomendasi produk.
  * Right: Sidebar profil customer, alamat pengiriman, dan riwayat pesanan customer.

[SCREEN 25] KELOLA REQUEST PRODUK MASUK (/admin/request)
- Tabel permohonan request titip barang masuk dari customer.
- Modal Detail Request: Foto referensi dari customer, link produk toko luar negeri, dan budget pelanggan.
- Modal "Beri Penawaran Harga (Quote)": Input nominal harga penawaran dalam Rupiah, masa berlaku penawaran (jam/hari), catatan admin -> Kirim penawaran ke akun customer.

[SCREEN 26] DAFTAR PELANGGAN (/admin/customer)
- Tabel data customer terdaftar: Nama, Email, No. WhatsApp, Total Pesanan, Tanggal Bergabung, dan status aktif.

[SCREEN 27] PENGATURAN TOKO (/admin/pengaturan)
- Tab 1: Rekening Bank Pembayaran (Nomor rekening BCA, Mandiri, nama pemilik, upload QRIS).
- Tab 2: Kurs & Fee Default (Nilai tukar JPY, KRW, THB, EUR, serta persentase fee jastip default).
- Tab 3: Operasional Toko (Jam layanan customer service, nomor kontak WhatsApp resmi).

[SCREEN 28] AUDIT LOG & RIWAYAT AKTIVITAS (/admin/log)
- Tabel log aktivitas sistem terperinci dengan timestamp: Nama Admin/Sistem, Aksi (ACC Order, Verifikasi Pembayaran, Update Status Trip, Edit Produk), IP Address, dan Detail perubahan status.
```

---

## 4. CHECKLIST FINAL VERIFIKASI SITEMAP

| No | Halaman / Rute | Kategori | Status di Prompt |
|:---|:---|:---|:---:|
| 1 | `/` (Beranda / Storefront) | Publik | [x] Lengkap |
| 2 | `/ready` (Katalog Ready Stock) | Publik | [x] Lengkap |
| 3 | `/ready/[slug]` (Detail Produk Ready) | Publik | [x] Lengkap |
| 4 | `/jastip` (Direktori Trip Jastip) | Publik | [x] Lengkap |
| 5 | `/jastip/[trip-slug]` (Detail Trip & Katalog) | Publik | [x] Lengkap |
| 6 | `/jastip/[trip-slug]/[slug]` (Detail Produk Jastip) | Publik | [x] Lengkap |
| 7 | `/login` & `/register` (Autentikasi & Modal) | Publik | [x] Lengkap |
| 8 | `/cara-order` (Panduan Alur 2-Tahap) | Publik | [x] Lengkap |
| 9 | `/faq` (Tanya Jawab Online) | Publik | [x] Lengkap |
| 10 | `/syarat-ketentuan` (Ketentuan Jastip & DP) | Publik | [x] Lengkap |
| 11 | `/wishlist` (Favorit Pelanggan) | Customer | [x] Lengkap |
| 12 | `/request` (Form Request & Riwayat Quote) | Customer | [x] Lengkap |
| 13 | `/chat` (Live Chat 1-on-1 dengan Admin) | Customer | [x] Lengkap |
| 14 | `/checkout` (Checkout Alamat Pengiriman) | Customer | [x] Lengkap |
| 15 | `/orders` (Daftar Riwayat Pesanan) | Customer | [x] Lengkap |
| 16 | `/orders/[kode-order]` (Tracking 8-Tahap) | Customer | [x] Lengkap |
| 17 | `/orders/[kode-order]/bayar` (Upload Bukti Transfer) | Customer | [x] Lengkap |
| 18 | `/notifikasi` (Pusat Notifikasi Akun) | Customer | [x] Lengkap |
| 19 | `/akun` (Pengaturan Profil & Password) | Customer | [x] Lengkap |
| 20 | `/admin` (Executive Dashboard) | Admin | [x] Lengkap |
| 21 | `/admin/order` (Kelola Order & Verifikasi ACC) | Admin | [x] Lengkap |
| 22 | `/admin/trip` & `/admin/trip/[id]` (Kelola Trip) | Admin | [x] Lengkap |
| 23 | `/admin/produk` (Katalog Produk Ready & Jastip) | Admin | [x] Lengkap |
| 24 | `/admin/chat` (Inbox Live Chat Admin) | Admin | [x] Lengkap |
| 25 | `/admin/request` (Kelola Request & Quote) | Admin | [x] Lengkap |
| 26 | `/admin/customer` (Direktori Pelanggan) | Admin | [x] Lengkap |
| 27 | `/admin/pengaturan` (Pengaturan Rekening & Kurs) | Admin | [x] Lengkap |
| 28 | `/admin/log` (Audit Log Aktivitas) | Admin | [x] Lengkap |
