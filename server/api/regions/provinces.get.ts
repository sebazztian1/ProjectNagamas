import { defineEventHandler, setResponseHeader } from 'h3'
import { getProvinces } from '../../utils/indonesiaRegions'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')
  return getProvinces()
})

