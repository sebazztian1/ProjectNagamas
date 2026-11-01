import { defineEventHandler, getQuery, setResponseHeader, createError } from 'h3'
import { getDistrictsByRegency } from '../../utils/indonesiaRegions'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const regency = String(query.regency || '').trim()
  if (!regency) {
    throw createError({ statusCode: 400, message: 'Parameter regency wajib diisi.' })
  }
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')
  return getDistrictsByRegency(regency)
})

