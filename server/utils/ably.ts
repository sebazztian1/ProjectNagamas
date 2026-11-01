import Ably from 'ably'
import { createError } from 'h3'

let ablyRest: Ably.Rest | null = null

export function useAblyRest(): Ably.Rest | null {
  const config = useRuntimeConfig()
  const key = (config.ablyApiKey as string || '').trim()
  if (!key || key === 'your-ably-api-key') {
    return null
  }
  if (!ablyRest) {
    ablyRest = new Ably.Rest({ key })
  }
  return ablyRest
}

export function requireAblyRest(): Ably.Rest {
  const client = useAblyRest()
  if (!client) {
    throw createError({
      statusCode: 503,
      message: 'ABLY_API_KEY belum dikonfigurasi di .env'
    })
  }
  return client
}

