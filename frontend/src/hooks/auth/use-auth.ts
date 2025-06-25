import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { queryKeys } from '@/lib/react-query'
import { LoginRequest, RegisterRequest, AuthTokens, User } from '@/types'

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthTokens> => {
      const response = await apiClient.post<AuthTokens>('/auth/login', data)
      return response.data
    },
    onSuccess: (tokens) => {
      apiClient.setTokens(tokens.accessToken, tokens.refreshToken)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile })
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post('/auth/register', data)
      return response.data
    },
  })
}

export function useProfile() {
  const setUser = useAuthStore((state) => state.setUser)

  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: async (): Promise<User> => {
      const response = await apiClient.get<User>('/auth/profile')
      return response.data
    },
    enabled: apiClient.isAuthenticated(),
    onSuccess: (user) => {
      setUser(user)
    },
    onError: () => {
      setUser(null)
      apiClient.clearAllTokens()
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Clear tokens and state
      apiClient.clearAllTokens()
      logout()
      queryClient.clear()
    },
  })
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiClient.put('/auth/profile', data)
      return response.data
    },
    onSuccess: (_, variables) => {
      updateUser(variables)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile })
    },
  })
}