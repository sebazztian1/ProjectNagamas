import { defineEventHandler, createError } from 'h3'
import { getSessionFromEvent } from '../../utils/session'
import { getUserSavedAddresses } from '../../utils/addresses'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Harap masuk terlebih dahulu.' })
  }
  return await getUserSavedAddresses(session.userId)
})

