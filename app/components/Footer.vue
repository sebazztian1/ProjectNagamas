<template>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-grid">
        <!-- Brand Info -->
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <span class="logo-text">dbb_luxe</span>
          </div>
          <p class="brand-desc">
            Layanan jastip luar negeri &amp; ready stock pilihan.
          </p>
        </div>

        <!-- Navigation Links -->
        <div class="footer-col">
          <h4 class="col-title">Menu</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/">Beranda</NuxtLink></li>
            <li><NuxtLink to="/ready">Ready Stock</NuxtLink></li>
            <li><NuxtLink to="/jastip">Jadwal Jastip</NuxtLink></li>
            <li><NuxtLink to="/request">Request Barang</NuxtLink></li>
          </ul>
        </div>

        <!-- Customer Support / Info -->
        <div class="footer-col">
          <h4 class="col-title">Bantuan</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/cara-order">Cara Order</NuxtLink></li>
            <li><NuxtLink to="/syarat-ketentuan">Syarat &amp; Ketentuan</NuxtLink></li>
            <li><NuxtLink :to="currentUser ? '/chat' : '/register'">Live Chat</NuxtLink></li>
          </ul>
        </div>

        <!-- Contact & Pickup Location -->
        <div class="footer-col">
          <h4 class="col-title">Kontak</h4>
          <div class="store-contact">
            <a
              v-for="item in contactItems"
              :key="item.href"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-card"
              :class="`contact-card--${item.platform}`"
              :aria-label="`${item.label} ${item.display}`"
            >
              <span class="contact-icon" aria-hidden="true">
                <svg
                  v-if="item.platform === 'whatsapp'"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.49 1.34 5.01L2 22l5.12-1.34A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.85 14.15c-.25.7-1.44 1.34-2 1.42-.51.08-1.17.11-1.89-.12-.44-.14-1-.33-1.72-.64-3.03-1.31-5.01-4.38-5.16-4.58-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.27-.3.6-.38.8-.38h.58c.18 0 .43-.07.68.52.25.6.85 2.08.93 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.32.39-.45.52-.15.15-.31.31-.13.62.17.3.78 1.29 1.68 2.1 1.16 1.03 2.13 1.35 2.43 1.5.3.15.48.13.66-.07.17-.2.75-.88.95-1.18.2-.3.4-.25.68-.15.27.1 1.75.83 2.05.98.3.15.5.22.58.35.07.12.07.72-.18 1.42z"
                  />
                </svg>
                <svg
                  v-else
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </span>
              <span class="contact-meta">
                <span class="contact-platform">{{ item.label }}</span>
                <strong class="contact-value">{{ item.display }}</strong>
              </span>
              <span class="contact-arrow" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 dbb_luxe.</p>
        <div class="footer-bottom-links">
          <NuxtLink to="/syarat-ketentuan">Kebijakan Privasi</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

interface ContactItem {
  platform: 'whatsapp' | 'instagram'
  label: string
  display: string
  href: string
}

const { currentUser } = useAuth()

const contactItems: ContactItem[] = [
  {
    platform: 'whatsapp',
    label: 'WhatsApp',
    display: '+62 813-3996-0303',
    href: 'https://wa.me/6281339960303',
  },
  {
    platform: 'whatsapp',
    label: 'WhatsApp',
    display: '+62 896-3333-9333',
    href: 'https://wa.me/6289633339333',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    display: '@dbb_luxe',
    href: 'https://www.instagram.com/dbb_luxe/',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    display: '@merchbybelle',
    href: 'https://www.instagram.com/merchbybelle/',
  },
]
</script>

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
  grid-template-columns: 1.4fr 0.95fr 0.95fr 1.4fr;
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 12px;
  color: #FFFFFF;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 4px 12px rgba(43, 33, 22, 0.1);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(43, 33, 22, 0.16);
  filter: brightness(1.05);
}

.contact-card:focus-visible {
  outline: 2px solid var(--brand-accent, #8C6D3F);
  outline-offset: 2px;
}

.contact-card--whatsapp {
  background: linear-gradient(135deg, #178742 0%, #0F7661 100%);
}

.contact-card--instagram {
  background:
    linear-gradient(125deg, rgba(16, 10, 24, 0.28) 0%, rgba(16, 10, 24, 0.24) 60%, rgba(16, 10, 24, 0.34) 100%),
    linear-gradient(125deg, #3B5BDB 0%, #833AB4 30%, #D62976 62%, #E03131 80%, #F59F00 100%);
}

.contact-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #FFFFFF;
}

.contact-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.contact-platform {
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.28);
}

.contact-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #FFFFFF;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.32);
}

.contact-arrow {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.88);
  flex-shrink: 0;
  transition: transform 0.18s ease, color 0.18s ease;
}

.contact-card:hover .contact-arrow {
  transform: translate(2px, -2px);
  color: #FFFFFF;
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

@media (max-width: 1100px) {
  .footer-grid {
    gap: 32px;
  }
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .contact-card {
    max-width: 300px;
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .contact-card {
    max-width: 320px;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
