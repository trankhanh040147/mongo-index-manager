import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 401
        if (error?.statusCode >= 400 && error?.statusCode < 500 && error?.statusCode !== 401) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

// Query keys factory
export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  databases: {
    all: ['databases'] as const,
    list: (params?: any) => ['databases', 'list', params] as const,
    detail: (id: string) => ['databases', 'detail', id] as const,
    collections: (id: string, params?: any) => ['databases', id, 'collections', params] as const,
  },
  indexes: {
    all: ['indexes'] as const,
    list: (databaseId: string, collection: string, params?: any) => 
      ['indexes', 'list', databaseId, collection, params] as const,
    detail: (id: string) => ['indexes', 'detail', id] as const,
    compare: (databaseId: string, collections: string[]) => 
      ['indexes', 'compare', databaseId, collections] as const,
  },
} as const