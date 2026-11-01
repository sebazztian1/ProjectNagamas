import { defineEventHandler, getQuery, setResponseHeader, createError } from 'h3'
import { getRegenciesByProvince } from '../../utils/indonesiaRegions'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const province = String(query.province || '').trim()
  if (!province) {
    throw createError({ statusCode: 400, message: 'Parameter province wajib diisi.' })
  }
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')
  return getRegenciesByProvince(province)
})

