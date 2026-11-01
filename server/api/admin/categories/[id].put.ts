import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { slugifyCategory } from '../../../utils/categories'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Memerlukan hak akses admin.' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID kategori tidak valid' })
  }

  const existing = await prisma.categories.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Kategori tidak ditemukan' })
  }

  const body = await readBody(event)
  const name = body?.name?.trim()

  if (!name) {
    throw createError({ statusCode: 400, message: 'Nama kategori wajib diisi' })
  }

  const baseSlug = slugifyCategory(name)
  let slug = baseSlug || 'kategori'
  let count = 1

  while (true) {
    const found = await prisma.categories.findUnique({ where: { slug } })
    if (!found || found.id === id) break
    slug = `${baseSlug}-${count}`
    count++
  }

  const updated = await prisma.categories.update({
    where: { id },
    data: { name, slug }
  })

  return {
    success: true,
    category: updated
  }
})

