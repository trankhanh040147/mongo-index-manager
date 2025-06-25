import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { queryKeys } from '@/lib/react-query'
import { Database, DatabaseCreateRequest, Collection, PaginatedResponse } from '@/types'

interface DatabaseListParams {
  query?: string
  page?: number
  limit?: number
}

export function useDatabases(params?: DatabaseListParams) {
  return useQuery({
    queryKey: queryKeys.databases.list(params),
    queryFn: async (): Promise<PaginatedResponse<Database>> => {
      const response = await apiClient.post<Database[]>('/databases/list', {
        query: params?.query || '',
        page: params?.page || 1,
        limit: params?.limit || 10,
      })
      return response as any // The API returns paginated data
    },
  })
}

export function useDatabase(id: string) {
  return useQuery({
    queryKey: queryKeys.databases.detail(id),
    queryFn: async (): Promise<Database> => {
      const response = await apiClient.get<Database>(`/databases/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateDatabase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: DatabaseCreateRequest) => {
      const response = await apiClient.post('/databases', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.databases.all })
    },
  })
}

export function useUpdateDatabase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DatabaseCreateRequest> }) => {
      const response = await apiClient.put(`/databases/${id}`, data)
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.databases.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.databases.all })
    },
  })
}

export function useDeleteDatabase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/databases/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.databases.all })
    },
  })
}

export function useDatabaseCollections(databaseId: string, params?: { query?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.databases.collections(databaseId, params),
    queryFn: async (): Promise<PaginatedResponse<Collection>> => {
      const response = await apiClient.post<Collection[]>('/databases/collections/list', {
        databaseId,
        query: params?.query || '',
        page: params?.page || 1,
        limit: params?.limit || 10,
      })
      return response as any
    },
    enabled: !!databaseId,
  })
}