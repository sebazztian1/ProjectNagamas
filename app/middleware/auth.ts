export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, isInitialized, fetchUser } = useAuth()

  if (!isInitialized.value) {
    await fetchUser()
  }

  if (!currentUser.value) {
    if (to.path.startsWith('/chat')) {
      return navigateTo({
        path: '/register',
        query: {
          redirect: to.fullPath
        }
      })
    }
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  }
})
