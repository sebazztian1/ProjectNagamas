<template>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-grid">
        <!-- Brand Info -->
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <span class="logo-text">dbb_luxe</span>
            <span class="logo-sub">Jastip & Ready Stock</span>
          </div>
          <p class="brand-desc">
            Layanan titip beli (Jastip) resmi luar negeri terpercaya ke Jepang, Korea Selatan, dan Bangkok, serta pilihan produk ready stock impor berkualitas.
          </p>
          <div class="trust-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>100% Produk Original dari Toko Resmi Luar Negeri</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="footer-col">
          <h4 class="col-title">Eksplorasi</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/">Beranda</NuxtLink></li>
            <li><NuxtLink to="/ready">Katalog Ready Stock</NuxtLink></li>
            <li><NuxtLink to="/jastip">Jadwal Trip Jastip (Open PO)</NuxtLink></li>
            <li><NuxtLink to="/request">Form Request Titip Barang</NuxtLink></li>
          </ul>
        </div>

        <!-- Customer Support / Info -->
        <div class="footer-col">
          <h4 class="col-title">Bantuan & Syarat</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/cara-order">Panduan Cara Order</NuxtLink></li>
            <li><NuxtLink to="/faq">Pertanyaan Umum (FAQ)</NuxtLink></li>
            <li><NuxtLink to="/syarat-ketentuan">Syarat & Ketentuan Jastip</NuxtLink></li>
            <li><NuxtLink to="/chat">Live Chat Customer Service</NuxtLink></li>
          </ul>
        </div>

        <!-- Contact & Pickup Location -->
        <div class="footer-col">
          <h4 class="col-title">Toko Fisik (Pickup)</h4>
          <p class="store-address">
            <strong>dbb_luxe Store Jakarta</strong><br />
            Ruko Pasar Baru Square No. 12<br />
            Sawah Besar, Jakarta Pusat 10710<br />
            Senin - Sabtu: 09:00 - 18:00 WIB
          </p>
          <div class="store-contact">
            <span>WhatsApp Admin: <strong>0812-9876-5432</strong></span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 dbb_luxe. Seluruh Hak Cipta Dilindungi. Sistem Jastip & Order Manual.</p>
        <div class="footer-bottom-links">
          <NuxtLink to="/syarat-ketentuan">Kebijakan Privasi</NuxtLink>
          <span>&bull;</span>
          <NuxtLink to="/admin">Portal Admin Toko</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #ffffff;
  border-top: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text, #1E293B);
  padding: 48px 20px 24px;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 36px;
  margin-bottom: 40px;
}

.footer-logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.logo-text {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
  letter-spacing: -0.5px;
}

.logo-sub {
  font-size: 0.75rem;
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.brand-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.5;
  margin-bottom: 14px;
}

.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #166534;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
}

.col-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links a {
  text-decoration: none;
  font-size: 0.86rem;
  color: var(--color-text-muted, #64748B);
  transition: color 0.15s;
}

.footer-links a:hover {
  color: var(--color-primary, #4A5D73);
}

.store-address {
  font-size: 0.85rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.5;
  margin-bottom: 10px;
}

.store-contact {
  font-size: 0.82rem;
  color: var(--color-primary, #4A5D73);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.8rem;
  color: var(--color-text-muted, #64748B);
  flex-wrap: wrap;
  gap: 12px;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-bottom-links a {
  text-decoration: none;
  color: var(--color-text-muted, #64748B);
}

.footer-bottom-links a:hover {
  color: var(--color-primary, #4A5D73);
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
