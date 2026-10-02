<template>
  <div class="static-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Syarat & Ketentuan</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Syarat & Ketentuan Layanan Jastip</h1>
        <p class="page-subtitle">Ketentuan pemesanan, verifikasi pembayaran manual, kebijakan pembatalan, dan pengambilan barang di dbb_luxe.</p>
      </div>

      <div class="legal-card">
        <section class="legal-sec">
          <h2>1. Ketentuan Umum Pre-Order (Jastip)</h2>
          <p>Layanan Jastip dbb_luxe adalah jasa pembelian barang titipan konsumen dari toko fisik/resmi di luar negeri. Seluruh produk yang dibelikan adalah 100% barang asli dengan struk pembelian resmi yang dapat diverifikasi.</p>
        </section>

        <section class="legal-sec">
          <h2>2. Persetujuan Admin (ACC) & Batas Waktu Pembayaran</h2>
          <p>Setiap pesanan yang dibuat akan ditinjau terlebih dahulu oleh Admin dbb_luxe untuk memastikan kuota bagasi dan ketersediaan barang. Setelah pesanan disetujui (ACC), konsumen memiliki waktu <strong>24 jam</strong> untuk menyelesaikan transfer manual. Tagihan mencakup Kode Unik 3 Digit untuk kemudahan pencocokan mutasi bank.</p>
        </section>

        <section class="legal-sec">
          <h2>3. Kebijakan Pembatalan & Refund</h2>
          <p>Pesanan yang sudah berstatus <strong>"Sedang Dibelikan"</strong> di luar negeri tidak dapat dibatalkan secara sepihak oleh konsumen. Apabila barang dinyatakan habis atau tidak ditemukan oleh admin di toko resmi luar negeri, maka dana akan dikembalikan penuh (100% Full Refund).</p>
        </section>

        <section class="legal-sec">
          <h2>4. Pengambilan Barang (Pickup) & Pengiriman</h2>
          <p>Metode utama penyelesaian barang adalah Pengambilan Mandiri (Self-Pickup) di toko fisik dbb_luxe Jakarta dengan menunjukkan Kode Order unik. Konsumen di luar kota dapat mengajukan pengiriman manual melalui kesepakatan ongkir dengan admin.</p>
        </section>
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
  margin-bottom: 30px;
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

.legal-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.legal-sec h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
  margin-bottom: 8px;
}

.legal-sec p {
  font-size: 0.9rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.6;
}
</style>
