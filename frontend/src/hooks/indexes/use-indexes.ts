import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { queryKeys } from '@/lib/react-query'
import { Index, IndexCreateRequest, CompareResult, PaginatedResponse } from '@/types'

interface IndexListParams {
  databaseId: string
  collection: string
  query?: string
  page?: number
  limit?: number
}

export function useIndexes(params: IndexListParams) {
  return useQuery({
    queryKey: queryKeys.indexes.list(params.databaseId, params.collection, params),
    queryFn: async (): Promise<PaginatedResponse<Index>> => {
      const response = await apiClient.post<Index[]>('/indexes/list-by-collection', {
        databaseId: params.databaseId,
        collection: params.collection,
        query: params.query || '',
        page: params.page || 1,
        limit: params.limit || 10,
      })
      return response as any
    },
    enabled: !!(params.databaseId && params.collection),
  })
}

export function useIndex(id: string) {
  return useQuery({
    queryKey: queryKeys.indexes.detail(id),
    queryFn: async (): Promise<Index> => {
      const response = await apiClient.get<Index>(`/indexes/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateIndex() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: IndexCreateRequest) => {
      const response = await apiClient.post('/indexes', data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.indexes.list(variables.databaseId, variables.collection)
      })
    },
  })
}

export function useUpdateIndex() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IndexCreateRequest> }) => {
      const response = await apiClient.put(`/indexes/${id}`, data)
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.indexes.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.indexes.all })
    },
  })
}

export function useDeleteIndex() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/indexes/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.indexes.all })
    },
  })
}

export function useCompareIndexes() {
  return useMutation({
    mutationFn: async ({ databaseId, collections }: { databaseId: string; collections: string[] }) => {
      const response = await apiClient.post<CompareResult[]>('/indexes/compare-by-collections', {
        databaseId,
        collections,
      })
      return response.data
    },
  })
}

export function useSyncIndexes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ databaseId, collections }: { databaseId: string; collections: string[] }) => {
      const response = await apiClient.post('/indexes/sync-by-collections', {
        databaseId,
        collections,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.indexes.all })
    },
  })
}