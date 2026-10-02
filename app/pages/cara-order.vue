<template>
  <div class="static-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Panduan Cara Order</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Panduan Langkah Demi Langkah Pemesanan</h1>
        <p class="page-subtitle">Pahami alur mudah berbelanja barang ready stock maupun menitip barang pre-order di dbb_luxe.</p>
      </div>

      <!-- Step Cards -->
      <div class="steps-flow">
        <div class="step-card">
          <div class="step-num">1</div>
          <div class="step-body">
            <h3>Pilih Jalur Belanja Anda (Ready Stock vs Jastip)</h3>
            <p>Buka halaman <strong>Ready Stock</strong> jika Anda membutuhkan barang yang siap kirim/ambil hari ini. Buka <strong>Jadwal Jastip</strong> jika Anda ingin menitipkan produk luar negeri pada trip keberangkatan admin.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">2</div>
          <div class="step-body">
            <h3>Checkout & Tunggu Persetujuan Admin (ACC)</h3>
            <p>Setelah mengajukan checkout, pesanan berstatus <em>"Menunggu Persetujuan Admin"</em>. Admin dbb_luxe akan memeriksa ketersediaan stok fisik di Pasar Baru atau sisa kuota koper traveler luar negeri terlebih dahulu.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">3</div>
          <div class="step-body">
            <h3>Pesanan Disetujui: Transfer Manual & Upload Bukti</h3>
            <p>Setelah di-ACC oleh admin, batas waktu pembayaran 24 jam mulai berjalan. Kirimkan pembayaran sesuai nominal (+ 3 digit kode unik) ke rekening resmi BCA/Mandiri atau QRIS dbb_luxe, lalu unggah foto bukti transfer di menu <em>Pesanan Saya &rarr; Bayar</em>.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">4</div>
          <div class="step-body">
            <h3>Pantau Tracking & Bukti Pembelian Toko Fisik</h3>
            <p>Admin mengonfirmasi pembayaran lunas. Untuk pesanan Jastip, admin akan mengunggah foto struk belanja asli dari toko luar negeri ke halaman tracking pesanan Anda setelah barang berhasil dibeli.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">5</div>
          <div class="step-body">
            <h3>Pengambilan Barang di Toko Fisik dbb_luxe</h3>
            <p>Saat status berubah menjadi <em>"Siap Diambil"</em>, Anda dapat langsung datang ke toko kami di Pasar Baru Jakarta dengan menunjukkan Kode Order (contoh: JST-20261002-001).</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.static-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 860px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.page-header {
  margin-bottom: 34px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.5;
}

.steps-flow {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.step-num {
  width: 40px;
  height: 40px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
}

.step-body h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  margin-bottom: 6px;
}

.step-body p {
  font-size: 0.88rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.5;
}
</style>
