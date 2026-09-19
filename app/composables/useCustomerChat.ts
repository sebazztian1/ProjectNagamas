import { ref, computed } from 'vue'
import type { Product } from '../types/product'
import type { ChatMessage, CustomerChat } from '../types/admin'
import { mockCustomerChats } from '../data/mockAdminData'

export const useCustomerChat = () => {
  // Widget Open/Closed State
  const isChatOpen = useState<boolean>('customer_chat_open', () => false)
  
  // Unread badge for customer (initial 1 for the welcome message)
  const customerUnreadCount = useState<number>('customer_unread_count', () => 1)

  // Currently attached product for product-specific inquiries
  const attachedProduct = useState<Product | null>('customer_attached_product', () => null)

  // Typing state for simulated admin reply
  const isAdminTyping = useState<boolean>('admin_is_typing', () => false)

  // Active customer messages stream (preloaded with realistic dummy conversation)
  const customerMessages = useState<ChatMessage[]>('customer_messages', () => [
    {
      id: 'msg-init-1',
      sender: 'admin',
      text: 'Halo kak! Selamat datang di Toko Nagamas. Ada yang bisa kami bantu seputar produk, ukuran, atau pesanan Anda hari ini? 😊',
      timestamp: '10:15'
    },
    {
      id: 'msg-init-2',
      sender: 'user',
      text: 'Halo min, mau tanya apakah kemeja Oversized French Linen Shirt bahannya adem dan tidak menerawang?',
      timestamp: '10:16'
    },
    {
      id: 'msg-init-3',
      sender: 'admin',
      text: 'Kemeja French Linen Shirt kami dibuat dari 100% Pure Organic Linen premium kak. Seratnya breathable, sangat sejuk, gramasi tebal pas sehingga tidak menerawang saat dipakai harian :)',
      timestamp: '10:17'
    }
  ])

  // Toggle chat widget open/close
  const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value
    if (isChatOpen.value) {
      customerUnreadCount.value = 0
    }
  }

  const openChat = () => {
    isChatOpen.value = true
    customerUnreadCount.value = 0
  }

  const closeChat = () => {
    isChatOpen.value = false
  }

  // Open chat with a specific product attached
  const openChatWithProduct = (product: Product) => {
    attachedProduct.value = product
    isChatOpen.value = true
    customerUnreadCount.value = 0
  }

  const removeAttachedProduct = () => {
    attachedProduct.value = null
  }

  // Smart dummy response generator based on customer query
  const getAutomatedReply = (query: string, product?: Product | null): string => {
    const q = query.toLowerCase()

    if (product) {
      if (q.includes('stok') || q.includes('ready') || q.includes('ada')) {
        return `Untuk produk *${product.name}*, stok di gudang kami saat ini ${product.stockCount > 0 ? `tersedia ${product.stockCount} unit siap kirim kak :)` : 'sedang kosong dan dalam proses restock kak.'}`
      }
      if (q.includes('harga') || q.includes('diskon') || q.includes('promo')) {
        return `Harga resmi untuk *${product.name}* adalah Rp ${new Intl.NumberFormat('id-ID').format(product.price)}. Kualitas bahan original bergaransi kak!`
      }
    }

    if (q.includes('stok') || q.includes('ready') || q.includes('ada') || q.includes('habis')) {
      return 'Semua produk yang bertanda "In Stock" di katalog kami selalu siap dikirim hari ini ya kak! Stok terhubung langsung dengan sistem inventaris gudang kami.'
    }

    if (q.includes('kirim') || q.includes('ongkir') || q.includes('resi') || q.includes('ekspedisi') || q.includes('sampai')) {
      return 'Pengiriman dilakukan setiap hari Senin-Sabtu via JNE, J&T, dan SiCepat. Pesanan yang masuk sebelum pukul 16:00 WIB dikirim di hari yang sama ya kak!'
    }

    if (q.includes('bayar') || q.includes('cod') || q.includes('transfer') || q.includes('qris') || q.includes('rekening')) {
      return 'Kami mendukung metode pembayaran Transfer Bank (BCA, Mandiri), QRIS instan seluruh e-wallet (GoPay, OVO, ShopeePay), dan COD (Bayar di Tempat).'
    }

    if (q.includes('retur') || q.includes('tukar') || q.includes('ukuran') || q.includes('size') || q.includes('garansi')) {
      return 'Tersedia garansi penukaran size dalam 7 hari kerja setelah barang diterima ya kak, asalkan tag label masih terpasang dan produk belum dicuci :)'
    }

    return 'Terima kasih atas pertanyaannya kak! Pesan kakak sudah tercatat oleh tim Customer Support Nagamas. Kami siap membantu setiap kebutuhan belanja kakak 😊'
  }

  // Customer sends message to Admin
  const sendCustomerMessage = (text: string, onNewAdminMessage?: (reply: string) => void) => {
    if (!text.trim()) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: timeStr
    }

    customerMessages.value.push(newMsg)

    // Also sync with the global mockCustomerChats for the admin view
    const mainCustomerChat = mockCustomerChats[0] // Aulia Putri Lestari or Active Chat
    if (mainCustomerChat) {
      mainCustomerChat.messages.push(newMsg)
      mainCustomerChat.lastMessage = text.trim()
      mainCustomerChat.lastMessageTime = 'Baru saja'
      mainCustomerChat.unreadCount += 1
      mainCustomerChat.status = 'unread'
    }

    const currentProduct = attachedProduct.value
    // Clear product context after sending
    attachedProduct.value = null

    // Simulate Admin typing indicator & automated reply
    isAdminTyping.value = true

    setTimeout(() => {
      isAdminTyping.value = false
      const replyText = getAutomatedReply(text, currentProduct)
      const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

      const adminMsg: ChatMessage = {
        id: `msg-admin-${Date.now()}`,
        sender: 'admin',
        text: replyText,
        timestamp: replyTime
      }

      customerMessages.value.push(adminMsg)

      if (mainCustomerChat) {
        mainCustomerChat.messages.push(adminMsg)
        mainCustomerChat.lastMessage = replyText
        mainCustomerChat.lastMessageTime = 'Baru saja'
      }

      if (!isChatOpen.value) {
        customerUnreadCount.value += 1
      }

      if (onNewAdminMessage) {
        onNewAdminMessage(replyText)
      }
    }, 1200)
  }

  return {
    isChatOpen,
    customerUnreadCount,
    attachedProduct,
    isAdminTyping,
    customerMessages,
    toggleChat,
    openChat,
    closeChat,
    openChatWithProduct,
    removeAttachedProduct,
    sendCustomerMessage
  }
}
