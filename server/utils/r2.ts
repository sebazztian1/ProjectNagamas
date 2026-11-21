import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createError } from 'h3'

let client: S3Client | null = null

export function useR2(): S3Client {
  if (!client) {
    const c = useRuntimeConfig()
    if (!c.r2AccountId || !c.r2AccessKeyId || !c.r2SecretAccessKey) {
      throw createError({
        statusCode: 500,
        message: 'Cloudflare R2 belum dikonfigurasi (cek R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)'
      })
    }

    client = new S3Client({
      region: 'auto',
      endpoint: `https://${c.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: c.r2AccessKeyId as string,
        secretAccessKey: c.r2SecretAccessKey as string,
      },
    })
  }
  return client
}

export const PUBLIC_MEDIA_FOLDERS = new Set(['products', 'trips', 'chat', 'requests'])

/**
 * Mengubah URL publik R2 (`*.r2.dev`, `r2:<key>`, `/api/media/<key>`) menjadi URL proxy
 * `/api/media/<key>` jika `R2_PUBLIC_URL` masih kosong atau memakai subdomain `*.r2.dev`
 * (yang sering diblokir ISP Indonesia), atau ke custom domain jika sudah dikonfigurasi.
 */
export function resolvePublicMediaUrl(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('private:')) return trimmed

  const cfg = useRuntimeConfig()
  const configuredPublicUrl = (typeof cfg.r2PublicUrl === 'string' ? cfg.r2PublicUrl : '').trim().replace(/\/+$/, '')
  let configuredHost = ''
  if (configuredPublicUrl) {
    try {
      configuredHost = new URL(configuredPublicUrl).hostname.toLowerCase()
    } catch {
      configuredHost = ''
    }
  }

  const useProxy = !configuredPublicUrl || !configuredHost || /\.r2\.dev$/i.test(configuredHost)

  let objectKey: string | null = null
  if (trimmed.startsWith('/api/media/')) {
    objectKey = trimmed.slice('/api/media/'.length)
  } else if (trimmed.startsWith('r2:')) {
    objectKey = trimmed.slice('r2:'.length)
  } else if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      const host = parsed.hostname.toLowerCase()
      if (/\.r2\.dev$/i.test(host) || (configuredHost && host === configuredHost)) {
        objectKey = parsed.pathname
      }
    } catch {
      return trimmed
    }
  }

  if (objectKey !== null) {
    const cleanKey = objectKey.replace(/^\/+/, '').split('?')[0] || ''
    const firstSegment = cleanKey.split('/')[0] || ''
    if (
      cleanKey &&
      !cleanKey.includes('..') &&
      !cleanKey.includes('\\') &&
      PUBLIC_MEDIA_FOLDERS.has(firstSegment)
    ) {
      return useProxy ? `/api/media/${cleanKey}` : `${configuredPublicUrl}/${cleanKey}`
    }
  }

  return trimmed
}

/**
 * Mengubah nilai `private:<path>` menjadi presigned URL sementara dari bucket privat R2.
 */
export async function signPrivate(value: string | null | undefined, seconds = 3600): Promise<string | null> {
  if (!value) return null
  if (!value.startsWith('private:')) return value

  const bucket = useRuntimeConfig().r2PrivateBucket as string
  const key = value.slice(8)

  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  return await getSignedUrl(useR2(), command, { expiresIn: seconds })
}

