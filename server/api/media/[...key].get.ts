import {
  defineEventHandler,
  getRouterParam,
  getHeader,
  setResponseHeader,
  setResponseStatus,
  send,
  createError
} from 'h3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { useR2 } from '../../utils/r2'

const VALID_KEY_PATTERN = /^(products|trips|chat|requests)\/[a-zA-Z0-9._/-]+$/

function inferContentType(key: string): string {
  const lower = key.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

export default defineEventHandler(async (event) => {
  const rawKey = getRouterParam(event, 'key') || ''
  let decodedSegments: string[]
  try {
    decodedSegments = rawKey
      .replace(/^\/+/, '')
      .split('/')
      .map((seg) => decodeURIComponent(seg))
  } catch {
    throw createError({ statusCode: 400, message: 'Media key tidak valid' })
  }

  const key = decodedSegments.join('/')
  if (
    !key ||
    decodedSegments.length < 2 ||
    decodedSegments.some((s) => !s) ||
    key.includes('..') ||
    key.includes('\\') ||
    key.includes('\0') ||
    !VALID_KEY_PATTERN.test(key)
  ) {
    throw createError({ statusCode: 400, message: 'Media key tidak valid' })
  }

  const bucket = useRuntimeConfig().r2PublicBucket as string
  let obj: any
  try {
    obj = await useR2().send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key
      })
    )
  } catch (err: any) {
    if (
      err?.name === 'NoSuchKey' ||
      err?.name === 'NotFound' ||
      err?.$metadata?.httpStatusCode === 404
    ) {
      throw createError({ statusCode: 404, message: 'Gambar tidak ditemukan' })
    }
    console.error('[media] R2 fetch error:', err?.message || err)
    throw createError({ statusCode: 502, message: 'Gagal mengambil gambar dari penyimpanan' })
  }

  const cacheControl = 'public, max-age=31536000, immutable'
  setResponseHeader(event, 'Cache-Control', cacheControl)
  setResponseHeader(event, 'CDN-Cache-Control', cacheControl)
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')

  if (obj.ETag) {
    setResponseHeader(event, 'ETag', obj.ETag)
    const ifNoneMatch = getHeader(event, 'if-none-match')
    if (
      ifNoneMatch &&
      ifNoneMatch.split(',').some((tag) => tag.trim() === obj.ETag || tag.trim() === '*')
    ) {
      setResponseStatus(event, 304)
      return ''
    }
  }

  if (!obj.Body) {
    throw createError({ statusCode: 404, message: 'Gambar tidak ditemukan' })
  }

  const contentType = obj.ContentType || inferContentType(key)
  const bytes = await obj.Body.transformToByteArray()
  return send(event, Buffer.from(bytes), contentType)
})
