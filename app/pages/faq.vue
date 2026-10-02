<template>
  <div class="static-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Pertanyaan Umum (FAQ)</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Pertanyaan yang Sering Diajukan (FAQ)</h1>
        <p class="page-subtitle">Informasi seputar cara kerja jastip luar negeri, sistem barang ready stock, verifikasi transfer, dan pengambilan barang.</p>
      </div>

      <div class="faq-list">
        <div v-for="(item, idx) in faqs" :key="idx" class="faq-card">
          <h3 class="faq-question">{{ item.q }}</h3>
          <p class="faq-answer">{{ item.a }}</p>
        </div>
      </div>

      <div class="contact-box">
        <h3>Masih punya pertanyaan yang belum terjawab?</h3>
        <p>Hubungi admin kami langsung melalui live chat di web atau WhatsApp untuk respon cepat.</p>
        <div class="contact-btns">
          <NuxtLink to="/chat" class="btn-chat">Buka Live Chat</NuxtLink>
          <a href="https://wa.me/6281298765432" target="_blank" class="btn-wa">WhatsApp Admin</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const faqs = [
  {
    q: 'Apa perbedaan antara produk "Ready Stock" dan "Jastip"?',
    a: 'Produk Ready Stock adalah barang yang sudah ada stok fisiknya di toko kami di Jakarta dan siap diambil hari ini atau langsung dikirim. Sedangkan produk Jastip adalah sistem Pre-Order (PO) di mana admin akan membelikan barang tersebut langsung dari toko fisik di luar negeri (Jepang, Korea, Thailand) sesuai jadwal trip keberangkatan.'
  },
  {
    q: 'Bagaimana sistem pembayaran transfer manual di dbb_luxe?',
    a: 'Setelah checkout diajukan, pesanan Anda akan ditinjau dan di-ACC oleh admin terlebih dahulu untuk memastikan ketersediaan kuota bagasi / stok toko. Setelah disetujui, Anda akan menerima tagihan dengan Kode Unik 3 Digit (contoh: Rp 215.147) dan batas waktu transfer 24 jam ke rekening resmi BCA/Mandiri atau QRIS dbb_luxe.'
  },
  {
    q: 'Apakah saya bisa membayar dengan DP (Down Payment)?',
    a: 'Ya, khusus untuk pemesanan Jastip di atas Rp 500.000, Anda dapat memilih opsi DP 50% terlebih dahulu. Pelunasan sisa tagihan dilakukan setelah admin mengonfirmasi barang telah berhasil dibeli di luar negeri dan tiba di Jakarta.'
  },
  {
    q: 'Bagaimana jika barang yang saya titip ternyata habis di toko luar negeri?',
    a: 'Kami memberikan Garansi 100% Uang Kembali (Full Refund). Jika barang habis atau tidak ditemukan selama masa trip, uang Anda akan dikembalikan utuh tanpa potongan biaya apapun.'
  },
  {
    q: 'Di mana saya bisa mengambil barang yang sudah dipesan?',
    a: 'Pengambilan mandiri (Self-Pickup) dapat dilakukan di toko fisik kami: dbb_luxe Store Jakarta, Ruko Pasar Baru Square No. 12, Sawah Besar, Jakarta Pusat. Anda cukup menunjukkan kode pesanan (contoh: JST-20261002-001) kepada staf kasir kami.'
  }
]
</script>

<style scoped>
.static-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 900px;
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
  margin-bottom: 36px;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--color-text-muted, #64748B);
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.5;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.faq-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 22px 24px;
}

.faq-question {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
  margin-bottom: 10px;
}

.faq-answer {
  font-size: 0.9rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.6;
}

.contact-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 14px;
  padding: 30px;
  text-align: center;
}

.contact-box h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 8px;
}

.contact-box p {
  font-size: 0.88rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 20px;
}

.contact-btns {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-chat {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 8px;
}

.btn-wa {
  background: #10B981;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 8px;
}
</style>
