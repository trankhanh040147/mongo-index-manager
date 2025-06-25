import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  theme: 'system',

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
  },

  toggleSidebar: () => {
    set({ sidebarOpen: !get().sidebarOpen })
  },

  setTheme: (theme) => {
    set({ theme })
    
    // Apply theme to document
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  },
}))