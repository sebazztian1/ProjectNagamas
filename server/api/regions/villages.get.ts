import { defineEventHandler, getQuery, setResponseHeader, createError } from 'h3'
import { getVillagesByDistrict } from '../../utils/indonesiaRegions'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const district = String(query.district || '').trim()
  if (!district) {
    throw createError({ statusCode: 400, message: 'Parameter district wajib diisi.' })
  }
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')
  return getVillagesByDistrict(district)
})

