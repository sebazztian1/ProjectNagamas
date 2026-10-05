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
            Layanan titip beli (Jastip) resmi luar negeri terpercaya .
          </p>
          <div class="trust-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>100% Produk Original</span>
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
          <p class="store-address">
            <strong>dbb_luxe</strong><br />
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
  background: var(--brand-neutral, #FFFBF2);
  border-top: 1px solid var(--brand-primary, #EFE1C6);
  color: var(--color-text, #2B2116);
  padding: 64px 24px 36px;
  margin-top: auto;
}

.footer-container {
  max-width: 1240px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 48px;
  margin-bottom: 48px;
}

.footer-logo {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.logo-text {
  font-family: var(--font-display, Georgia, serif);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--brand-accent, #8C6D3F);
  letter-spacing: -0.01em;
}

.logo-sub {
  font-size: 0.72rem;
  background: var(--brand-primary, #EFE1C6);
  color: var(--brand-accent, #8C6D3F);
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.05em;
  border: 1px solid rgba(216, 185, 120, 0.3);
}

.brand-desc {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
  line-height: 1.65;
  margin-bottom: 18px;
}

.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--brand-primary, #EFE1C6);
  border: 1px solid var(--brand-secondary, #D8B978);
  color: var(--brand-accent, #8C6D3F);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: var(--radius-sm, 8px);
}

.col-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--brand-accent, #8C6D3F);
  margin-bottom: 18px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-links a {
  text-decoration: none;
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
  transition: color 0.15s ease;
}

.footer-links a:hover {
  color: var(--brand-accent, #8C6D3F);
}

.store-address {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
  line-height: 1.6;
  margin-bottom: 12px;
}

.store-contact {
  font-size: 0.85rem;
  color: var(--brand-accent, #8C6D3F);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 28px;
  border-top: 1px solid var(--brand-primary, #EFE1C6);
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  flex-wrap: wrap;
  gap: 14px;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-bottom-links a {
  color: inherit;
  text-decoration: none;
  transition: color 0.15s;
}

.footer-bottom-links a:hover {
  color: var(--brand-accent, #8C6D3F);
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
