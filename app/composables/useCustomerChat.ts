import Ably from 'ably'
import { useAuth } from './useAuth'
import { useNotifications } from './useNotifications'
import { useToast } from './useToast'

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

export interface ChatTripSnapshot {
  id: number
  title: string
  slug: string
  country: string
  cityOrArea?: string
  coverImageUrl?: string | null
  status?: string
  closeDate?: string | Date | null
  estimatedArrivalDate?: string | Date | null
}

export interface ChatRequestSnapshot {
  id: number
  productName: string
  description?: string
  referenceImageUrl?: string | null
  referenceLink?: string | null
  status?: string
  quotedPrice?: number | null
  tripTitle?: string | null
  tripCountry?: string | null
}

export interface LiveChatMessage {
  id: number | string
  roomId?: number
  senderId?: number
  senderRole: 'customer' | 'admin' | 'staff'
  sender: 'user' | 'admin'
  messageType: 'text' | 'image' | 'product' | 'jastip' | 'request'
  content: string | null
  text: string
  imageUrl?: string | null
  productId?: number | null
  tripId?: number | null
  requestId?: number | null
  product?: ChatProductSnapshot | null
  trip?: ChatTripSnapshot | null
  productRequest?: ChatRequestSnapshot | null
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
    tripId: m.tripId || null,
    requestId: m.requestId || null,
    product: m.product || null,
    trip: m.trip || null,
    productRequest: m.productRequest || null,
    isRead: m.isRead ?? false,
    createdAt: m.createdAt,
    timestamp: m.timestamp || formatTime(m.createdAt)
  }
}

export const useCustomerChat = () => {
  const { currentUser } = useAuth()
  const { fetchNotifications } = useNotifications()
  const { showToast } = useToast()
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
          fetchNotifications(true)
        } else if (incoming.sender === 'admin' && isChatOpen.value) {
          $fetch('/api/chat/read', { method: 'POST', body: {} }).catch(() => {})
          fetchNotifications(true)
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

  const redirectGuestToRegister = async () => {
    isChatOpen.value = false
    showToast('Daftar Akun Terlebih Dahulu', 'Silakan daftar akun untuk menggunakan fitur Live Chat.', 'info')
    await navigateTo('/register')
  }

  const toggleChat = async () => {
    if (isAdmin.value) return
    if (!currentUser.value) {
      await redirectGuestToRegister()
      return
    }
    isChatOpen.value = !isChatOpen.value
    if (isChatOpen.value) {
      customerUnreadCount.value = 0
      await loadCustomerRoom()
    }
  }

  const openChat = async () => {
    if (isAdmin.value) return
    if (!currentUser.value) {
      await redirectGuestToRegister()
      return
    }
    isChatOpen.value = true
    customerUnreadCount.value = 0
    await loadCustomerRoom()
  }

  const closeChat = () => {
    isChatOpen.value = false
  }

  const attachProductToChat = (product: any) => {
    if (isAdmin.value) return
    const isJastip = product.productType === 'jastip'
    attachedProduct.value = {
      kind: isJastip ? 'jastip_product' : 'product',
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image || product.imageUrl,
      productType: product.productType || 'ready',
      tripId: product.trip?.id || product.tripId || null,
      tripTitle: product.trip?.title || product.tripTitle || null,
      stockCount: product.stockQuantity ?? product.stockCount ?? (product.inStock ? 10 : 0)
    }
  }

  const attachTripToChat = (trip: any) => {
    if (isAdmin.value) return
    attachedProduct.value = {
      kind: 'jastip_trip',
      id: trip.id,
      tripId: trip.id,
      name: trip.title,
      slug: trip.slug,
      image: trip.coverImageUrl || null,
      country: trip.country,
      flag: trip.flag || '✈️',
      cityOrArea: trip.cityOrArea || '',
      status: trip.status,
      closeDate: trip.closeDate
    }
  }

  const attachRequestToChat = (req: any) => {
    if (isAdmin.value) return
    attachedProduct.value = {
      kind: 'request',
      id: req.id,
      requestId: req.id,
      name: req.productName,
      image: req.referenceImageUrl || null,
      status: req.status,
      quotedPrice: req.quotedPrice || null,
      tripTitle: req.tripTitle || null,
      targetCountry: req.targetCountry || null
    }
  }

  const openChatWithProduct = async (product: any) => {
    if (isAdmin.value) return
    if (!currentUser.value) {
      await redirectGuestToRegister()
      return
    }
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
    options?: {
      imageUrl?: string
      productId?: number
      tripId?: number
      requestId?: number
      messageType?: 'text' | 'image' | 'product' | 'jastip' | 'request'
    }
  ) => {
    if (!currentUser.value) {
      await redirectGuestToRegister()
      return
    }

    const trimmed = text.trim()
    const itemToAttach = attachedProduct.value
    if (
      !trimmed &&
      !options?.imageUrl &&
      !itemToAttach &&
      !options?.productId &&
      !options?.tripId &&
      !options?.requestId
    ) {
      return
    }

    try {
      if (itemToAttach && itemToAttach.id) {
        let payloadBody: Record<string, any> = {
          content: trimmed || null
        }

        if (itemToAttach.kind === 'jastip_trip') {
          payloadBody.messageType = 'jastip'
          payloadBody.tripId = Number(itemToAttach.id)
        } else if (itemToAttach.kind === 'request') {
          payloadBody.messageType = 'request'
          payloadBody.requestId = Number(itemToAttach.id)
        } else if (itemToAttach.kind === 'jastip_product' || itemToAttach.productType === 'jastip') {
          payloadBody.messageType = 'jastip'
          payloadBody.productId = Number(itemToAttach.id)
          if (itemToAttach.tripId) payloadBody.tripId = Number(itemToAttach.tripId)
        } else {
          payloadBody.messageType = 'product'
          payloadBody.productId = Number(itemToAttach.id)
        }

        const sentAttachment = await $fetch<any>('/api/chat/send', {
          method: 'POST',
          body: payloadBody
        })
        attachedProduct.value = null
        const mapped = mapApiMessage(sentAttachment)
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
          productId: options?.productId || null,
          tripId: options?.tripId || null,
          requestId: options?.requestId || null
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
    attachTripToChat,
    attachRequestToChat,
    openChatWithProduct,
    removeAttachedProduct,
    sendCustomerMessage
  }
}
