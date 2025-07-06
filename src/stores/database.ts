import { create } from 'zustand'
import { Database, DatabaseCreate, DatabaseUpdate } from '@/types/api'
import { apiClient } from '@/lib/api'

interface DatabaseState {
  databases: Database[]
  selectedDatabase: Database | null
  collections: string[]
  selectedCollection: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadDatabases: () => Promise<void>
  createDatabase: (data: DatabaseCreate) => Promise<void>
  updateDatabase: (id: string, data: DatabaseUpdate) => Promise<void>
  deleteDatabase: (id: string) => Promise<void>
  selectDatabase: (database: Database | null) => void
  loadCollections: (databaseId: string) => Promise<void>
  selectCollection: (collection: string | null) => void
  clearError: () => void
}

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  databases: [],
  selectedDatabase: null,
  collections: [],
  selectedCollection: null,
  isLoading: false,
  error: null,

  loadDatabases: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.listDatabases({ page: 1, limit: 100 })
      if (response.data) {
        set({ databases: response.data })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load databases' })
    } finally {
      set({ isLoading: false })
    }
  },

  createDatabase: async (data: DatabaseCreate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createDatabase(data)
      if (response.data) {
        set(state => ({ 
          databases: [...state.databases, response.data!] 
        }))
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create database' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateDatabase: async (id: string, data: DatabaseUpdate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateDatabase(id, data)
      if (response.data) {
        set(state => ({
          databases: state.databases.map(db => 
            db.id === id ? response.data! : db
          ),
          selectedDatabase: state.selectedDatabase?.id === id ? response.data! : state.selectedDatabase
        }))
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update database' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteDatabase: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteDatabase(id)
      set(state => ({
        databases: state.databases.filter(db => db.id !== id),
        selectedDatabase: state.selectedDatabase?.id === id ? null : state.selectedDatabase,
        collections: state.selectedDatabase?.id === id ? [] : state.collections,
        selectedCollection: state.selectedDatabase?.id === id ? null : state.selectedCollection
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete database' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  selectDatabase: (database: Database | null) => {
    set({ 
      selectedDatabase: database, 
      collections: [], 
      selectedCollection: null 
    })
    if (database) {
      get().loadCollections(database.id)
    }
  },

  loadCollections: async (databaseId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.listCollections(databaseId)
      if (response.data) {
        set({ collections: response.data })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load collections' })
    } finally {
      set({ isLoading: false })
    }
  },

  selectCollection: (collection: string | null) => {
    set({ selectedCollection: collection })
  },

  clearError: () => {
    set({ error: null })
  },
}))