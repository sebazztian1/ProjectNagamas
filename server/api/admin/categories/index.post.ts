import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { slugifyCategory } from '../../../utils/categories'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Memerlukan hak akses admin.' })
  }

  const body = await readBody(event)
  const name = body?.name?.trim()

  if (!name) {
    throw createError({ statusCode: 400, message: 'Nama kategori wajib diisi' })
  }

  const baseSlug = slugifyCategory(name)
  let slug = baseSlug || 'kategori'
  let count = 1

  while (await prisma.categories.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count}`
    count++
  }

  const created = await prisma.categories.create({
    data: {
      name,
      slug
    }
  })

  return {
    success: true,
    category: created
  }
})

