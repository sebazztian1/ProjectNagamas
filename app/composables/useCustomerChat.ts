import Ably from 'ably'
import { useAuth } from './useAuth'

export interface ChatProductSnapshot {
  id: number
  name: string
  slug: string
  price: number
  imageUrl?: string | null
  productType?: 'ready' | 'jastip'
  stockStatus?: string
  tripSlug?: string | null
  tripTitle?: string | null
}

export interface LiveChatMessage {
  id: number | string
  roomId?: number
  senderId?: number
  senderRole: 'customer' | 'admin' | 'staff'
  sender: 'user' | 'admin'
  messageType: 'text' | 'image' | 'product'
  content: string | null
  text: string
  imageUrl?: string | null
  productId?: number | null
  product?: ChatProductSnapshot | null
  isRead?: boolean
  createdAt?: string
  timestamp: string
}

let realtimeInstance: Ably.Realtime | null = null
let activeChannel: Ably.RealtimeChannel | null = null
let subscribedRoomId: number | null = null

function formatTime(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date()
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function mapApiMessage(m: any): LiveChatMessage {
  const role = m.senderRole || (m.sender === 'user' ? 'customer' : 'admin')
  return {
    id: m.id,
    roomId: m.roomId,
    senderId: m.senderId,
    senderRole: role,
    sender: role === 'customer' ? 'user' : 'admin',
    messageType: m.messageType || 'text',
    content: m.content ?? m.text ?? '',
    text: m.content ?? m.text ?? '',
    imageUrl: m.imageUrl || null,
    productId: m.productId || null,
    product: m.product || null,
    isRead: m.isRead ?? false,
    createdAt: m.createdAt,
    timestamp: m.timestamp || formatTime(m.createdAt)
  }
}

export const useCustomerChat = () => {
  const { currentUser } = useAuth()
  const isAdmin = computed(() => currentUser.value?.role === 'admin' || currentUser.value?.role === 'staff')

  const isChatOpen = useState<boolean>('customer_chat_open', () => false)
  const customerUnreadCount = useState<number>('customer_unread_count', () => 0)
  const customerRoomId = useState<number | null>('customer_room_id', () => null)
  const attachedProduct = useState<any | null>('customer_attached_product', () => null)
  const isAdminTyping = useState<boolean>('admin_is_typing', () => false)
  const customerMessages = useState<LiveChatMessage[]>('customer_messages', () => [])
  const isLoaded = useState<boolean>('customer_chat_loaded', () => false)

  const connectAblyForCustomer = async (roomId: number) => {
    if (import.meta.server) return
    if (subscribedRoomId === roomId && activeChannel) return

    try {
      if (!realtimeInstance) {
        realtimeInstance = new Ably.Realtime({
          authUrl: '/api/chat/token'
        })
      }
      if (activeChannel) {
        activeChannel.unsubscribe()
      }
      activeChannel = realtimeInstance.channels.get(`chat:room-${roomId}`)
      subscribedRoomId = roomId

      await activeChannel.subscribe('new-message', (message) => {
        const incoming = mapApiMessage(message.data)
        const exists = customerMessages.value.some(m => String(m.id) === String(incoming.id))
        if (!exists) {
          customerMessages.value.push(incoming)
        }
        if (incoming.sender === 'admin' && !isChatOpen.value) {
          customerUnreadCount.value += 1
        } else if (incoming.sender === 'admin' && isChatOpen.value) {
          $fetch('/api/chat/read', { method: 'POST', body: {} }).catch(() => {})
        }
      })
    } catch (err) {
      // Ably belum dikonfigurasi atau gagal konek; tetap berjalan dengan database API
    }
  }

  const loadCustomerRoom = async () => {
    if (!currentUser.value || isAdmin.value) return
    try {
      const res = await $fetch<{ room: any; messages: any[] }>('/api/chat/room')
      if (res?.room) {
        customerRoomId.value = res.room.id
        customerUnreadCount.value = res.room.unreadCustomerCount || 0
        customerMessages.value = (res.messages || []).map(mapApiMessage)
        isLoaded.value = true
        await connectAblyForCustomer(res.room.id)
      }
    } catch (err) {
      // Abaikan jika guest/belum login
    }
  }

  const toggleChat = async () => {
    if (isAdmin.value) return
    isChatOpen.value = !isChatOpen.value
    if (isChatOpen.value) {
      customerUnreadCount.value = 0
      await loadCustomerRoom()
    }
  }

  const openChat = async () => {
    if (isAdmin.value) return
    isChatOpen.value = true
    customerUnreadCount.value = 0
    await loadCustomerRoom()
  }

  const closeChat = () => {
    isChatOpen.value = false
  }

  const attachProductToChat = (product: any) => {
    if (isAdmin.value) return
    attachedProduct.value = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image || product.imageUrl,
      productType: product.productType || 'ready',
      tripTitle: product.trip?.title || product.tripTitle || null,
      stockCount: product.stockQuantity ?? product.stockCount ?? (product.inStock ? 10 : 0)
    }
  }

  const openChatWithProduct = async (product: any) => {
    if (isAdmin.value) return
    attachProductToChat(product)
    isChatOpen.value = true
    customerUnreadCount.value = 0
    await loadCustomerRoom()
  }

  const removeAttachedProduct = () => {
    attachedProduct.value = null
  }

  const sendCustomerMessage = async (
    text: string,
    onNewAdminMessage?: (reply: string) => void,
    options?: { imageUrl?: string; productId?: number; messageType?: 'text' | 'image' | 'product' }
  ) => {
    const trimmed = text.trim()
    const prodToAttach = attachedProduct.value
    if (!trimmed && !options?.imageUrl && !prodToAttach && !options?.productId) return

    try {
      // Jika ada produk terlampir, kirim kartu produk terlebih dahulu atau bersamaan
      if (prodToAttach && prodToAttach.id) {
        const prodMsg = await $fetch<any>('/api/chat/send', {
          method: 'POST',
          body: {
            messageType: 'product',
            productId: Number(prodToAttach.id),
            content: trimmed || null
          }
        })
        attachedProduct.value = null
        const mapped = mapApiMessage(prodMsg)
        if (!customerMessages.value.some(m => String(m.id) === String(mapped.id))) {
          customerMessages.value.push(mapped)
        }
        return
      }

      const sent = await $fetch<any>('/api/chat/send', {
        method: 'POST',
        body: {
          messageType: options?.messageType || (options?.imageUrl ? 'image' : 'text'),
          content: trimmed,
          imageUrl: options?.imageUrl || null,
          productId: options?.productId || null
        }
      })

      const mapped = mapApiMessage(sent)
      if (!customerMessages.value.some(m => String(m.id) === String(mapped.id))) {
        customerMessages.value.push(mapped)
      }
    } catch (err) {
      // Fallback jika user belum login
    }
  }

  return {
    isChatOpen,
    customerUnreadCount,
    customerRoomId,
    attachedProduct,
    isAdminTyping,
    customerMessages,
    isLoaded,
    loadCustomerRoom,
    toggleChat,
    openChat,
    closeChat,
    attachProductToChat,
    openChatWithProduct,
    removeAttachedProduct,
    sendCustomerMessage
  }
}
