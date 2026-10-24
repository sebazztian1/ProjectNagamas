import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const ALLOWED_FOLDERS = ['products', 'trips', 'chat', 'requests', 'receipts', 'purchase-proofs']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, message: 'Tidak ada file yang diunggah' })
  }

  // Look for target folder param (default to 'requests')
  let targetFolder = 'requests'
  const folderPart = parts.find(p => p.name === 'folder')
  if (folderPart && folderPart.data) {
    const specified = folderPart.data.toString().trim()
    if (ALLOWED_FOLDERS.includes(specified)) {
      targetFolder = specified
    }
  }

  // Look for the file part
  const filePart = parts.find(p => p.name === 'file' && p.filename)
  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, message: 'File tidak ditemukan dalam request' })
  }

  // Validate MIME type
  if (filePart.type && !ALLOWED_MIME_TYPES.includes(filePart.type)) {
    throw createError({ statusCode: 400, message: 'Format file tidak didukung. Harap upload format JPG, PNG, atau WebP.' })
  }

  // Validate file size
  if (filePart.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, message: 'Ukuran file melebihi batas maksimal 5MB' })
  }

  // Generate safe unique filename
  const extension = path.extname(filePart.filename || '').toLowerCase() || '.jpg'
  const randomHash = crypto.randomBytes(8).toString('hex')
  const newFilename = `${targetFolder}-${Date.now()}-${randomHash}${extension}`

  const destinationDir = path.resolve(process.cwd(), 'public', 'uploads', targetFolder)
  await fs.mkdir(destinationDir, { recursive: true })

  const filePath = path.join(destinationDir, newFilename)
  await fs.writeFile(filePath, filePart.data)

  const publicUrl = `/uploads/${targetFolder}/${newFilename}`

  return {
    success: true,
    url: publicUrl,
    filename: newFilename,
    folder: targetFolder,
    size: filePart.data.length
  }
})
