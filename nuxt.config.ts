// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2PublicBucket: process.env.R2_PUBLIC_BUCKET || 'public-images',
    r2PrivateBucket: process.env.R2_PRIVATE_BUCKET || 'private-proofs',
    r2PublicUrl: process.env.R2_PUBLIC_URL,
    ablyApiKey: process.env.ABLY_API_KEY || '',
  },
  app: {
    head: {
      title: 'dbb_luxe | Luxury Fashion & Authentic Jastip',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'dbb_luxe — layanan jastip resmi luar negeri dan koleksi ready stock pilihan. Dikirim langsung dan aman ke seluruh Indonesia.' },
        { name: 'theme-color', content: '#FFFBF2' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Poppins:wght@400;500;600;700;800&display=swap' }
      ]
    }
  }
})
