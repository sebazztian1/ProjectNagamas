import { defineEventHandler, readBody, createError } from 'h3'
import { getSessionFromEvent } from '../../utils/session'
import { validateAndBuildAddressSnapshot, saveUserAddress } from '../../utils/addresses'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Harap masuk terlebih dahulu.' })
  }

  const body = await readBody(event)
  const validation = validateAndBuildAddressSnapshot(body)
  if (!validation.valid || !validation.data) {
    const firstMsg = Object.values(validation.errors)[0] || 'Data alamat tidak valid.'
    throw createError({
      statusCode: 400,
      message: firstMsg,
      data: { errors: validation.errors }
    })
  }

  return await saveUserAddress(session.userId, validation.data)
})

