import { create } from 'zustand'
import { Index, IndexCreate, IndexUpdate, ComparisonResult } from '@/types/api'
import { apiClient } from '@/lib/api'

interface IndexState {
  indexes: Index[]
  selectedIndex: Index | null
  comparisonResult: ComparisonResult | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadIndexes: (collectionId: string) => Promise<void>
  createIndex: (data: IndexCreate) => Promise<void>
  updateIndex: (id: string, data: IndexUpdate) => Promise<void>
  deleteIndex: (id: string) => Promise<void>
  selectIndex: (index: Index | null) => void
  compareIndexesByCollections: (sourceId: string, targetId: string) => Promise<void>
  syncIndexesByCollections: (sourceId: string, targetId: string) => Promise<void>
  clearError: () => void
  clearComparison: () => void
}

export const useIndexStore = create<IndexState>((set, get) => ({
  indexes: [],
  selectedIndex: null,
  comparisonResult: null,
  isLoading: false,
  error: null,

  loadIndexes: async (collectionId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.listIndexesByCollection(collectionId)
      if (response.data) {
        set({ indexes: response.data })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load indexes' })
    } finally {
      set({ isLoading: false })
    }
  },

  createIndex: async (data: IndexCreate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createIndex(data)
      if (response.data) {
        set(state => ({ 
          indexes: [...state.indexes, response.data!] 
        }))
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create index' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateIndex: async (id: string, data: IndexUpdate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateIndex(id, data)
      if (response.data) {
        set(state => ({
          indexes: state.indexes.map(index => 
            index.id === id ? response.data! : index
          ),
          selectedIndex: state.selectedIndex?.id === id ? response.data! : state.selectedIndex
        }))
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update index' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteIndex: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteIndex(id)
      set(state => ({
        indexes: state.indexes.filter(index => index.id !== id),
        selectedIndex: state.selectedIndex?.id === id ? null : state.selectedIndex
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete index' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  selectIndex: (index: Index | null) => {
    set({ selectedIndex: index })
  },

  compareIndexesByCollections: async (sourceId: string, targetId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.compareIndexesByCollections({
        source_collection_id: sourceId,
        target_collection_id: targetId
      })
      if (response.data) {
        set({ comparisonResult: response.data })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to compare indexes' })
    } finally {
      set({ isLoading: false })
    }
  },

  syncIndexesByCollections: async (sourceId: string, targetId: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.syncIndexesByCollections({
        source_collection_id: sourceId,
        target_collection_id: targetId
      })
      // Reload indexes after sync
      await get().loadIndexes(targetId)
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sync indexes' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  clearError: () => {
    set({ error: null })
  },

  clearComparison: () => {
    set({ comparisonResult: null })
  },
}))