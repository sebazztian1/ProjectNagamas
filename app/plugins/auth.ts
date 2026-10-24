export default defineNuxtPlugin(async () => {
  const { fetchUser, isInitialized } = useAuth()
  if (!isInitialized.value) {
    await fetchUser()
  }
})
