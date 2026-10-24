export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, isInitialized, fetchUser } = useAuth()

  if (!isInitialized.value) {
    await fetchUser()
  }

  // If not logged in, redirect to login with return path
  if (!currentUser.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  }

  // If logged in but not admin/staff, redirect to home
  if (currentUser.value.role !== 'admin' && currentUser.value.role !== 'staff') {
    return navigateTo('/')
  }
})
