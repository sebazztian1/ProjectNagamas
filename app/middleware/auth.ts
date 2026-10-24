export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, isInitialized, fetchUser } = useAuth()

  if (!isInitialized.value) {
    await fetchUser()
  }

  if (!currentUser.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  }
})
