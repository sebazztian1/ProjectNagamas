import { computed, ref } from 'vue'

export interface User {
  id: number
  username: string
  phone_number: string
  role: 'customer' | 'admin' | 'staff'
}

export interface RegisterPayload {
  username: string
  phone_number: string
  password: string
  confirmPassword?: string
}

export interface LoginPayload {
  identifier: string
  password: string
}

export interface UpdateProfilePayload {
  phone_number: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const useAuth = () => {
  const currentUser = useState<User | null>('auth_user', () => null)
  const isInitialized = useState<boolean>('auth_initialized', () => false)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin' || currentUser.value?.role === 'staff')

  // Fetch current user from server (SSR + Client compatible)
  const fetchUser = async (): Promise<User | null> => {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const response = await $fetch<{ user: User | null }>('/api/auth/me', {
        headers
      })
      currentUser.value = response.user
      return response.user
    } catch {
      currentUser.value = null
      return null
    } finally {
      isInitialized.value = true
    }
  }

  // Login handler
  const login = async (credentials: LoginPayload): Promise<User> => {
    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean; message: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      currentUser.value = response.user
      return response.user
    } finally {
      isLoading.value = false
    }
  }

  // Register handler
  const register = async (payload: RegisterPayload): Promise<User> => {
    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean; message: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: payload
      })
      currentUser.value = response.user
      return response.user
    } finally {
      isLoading.value = false
    }
  }

  // Logout handler
  const logout = async () => {
    isLoading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network error on logout
    } finally {
      currentUser.value = null
      isLoading.value = false
    }
  }

  // Update Profile
  const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean; message: string; user: User }>('/api/auth/update-profile', {
        method: 'PUT',
        body: payload
      })
      currentUser.value = response.user
      return response.user
    } finally {
      isLoading.value = false
    }
  }

  // Change Password
  const changePassword = async (payload: ChangePasswordPayload) => {
    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean; message: string }>('/api/auth/change-password', {
        method: 'PUT',
        body: payload
      })
      return response
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentUser,
    isInitialized,
    isLoading,
    isAuthenticated,
    isAdmin,
    fetchUser,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  }
}
