export interface User {
  name: string
  email: string
  phone?: string
}

export const useAuth = () => {
  const currentUser = useState<User | null>('auth_user', () => null)

  const login = (user: User) => {
    currentUser.value = user
  }

  const logout = () => {
    currentUser.value = null
  }

  return {
    currentUser,
    login,
    logout
  }
}
