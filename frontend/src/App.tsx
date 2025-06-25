import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/react-query'

// Layout
import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'

// Pages
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { DashboardPage } from '@/pages/dashboard'
import { DatabasesPage } from '@/pages/databases'

// Hooks
import { useProfile } from '@/hooks/auth/use-auth'
import { useUIStore } from '@/stores/ui-store'
import { useEffect } from 'react'

function AppContent() {
  const setTheme = useUIStore((state) => state.setTheme)
  const theme = useUIStore((state) => state.theme)

  // Initialize theme
  useEffect(() => {
    setTheme(theme)
  }, [setTheme, theme])

  // Load user profile if authenticated
  useProfile()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="databases" element={<DatabasesPage />} />
        {/* Add more protected routes here */}
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App