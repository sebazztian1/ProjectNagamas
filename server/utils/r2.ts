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

