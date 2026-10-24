import { defineEventHandler } from 'h3'
import { clearSessionCookie } from '../../utils/session'

export default defineEventHandler(async (event) => {
  clearSessionCookie(event)
  return {
    success: true,
    message: 'Berhasil keluar'
  }
})
