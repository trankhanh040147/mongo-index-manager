import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { Toaster } from '@/components/ui/toaster'
import AuthLayout from '@/components/layout/AuthLayout'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import DatabasesPage from '@/pages/DatabasesPage'
import IndexesPage from '@/pages/IndexesPage'
import ComparePage from '@/pages/ComparePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { isAuthenticated, loadUser } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !isAuthenticated) {
      loadUser()
    }
  }, [isAuthenticated, loadUser])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            } />
            <Route path="/register" element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/databases" element={
              <ProtectedRoute>
                <MainLayout>
                  <DatabasesPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/indexes" element={
              <ProtectedRoute>
                <MainLayout>
                  <IndexesPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/compare" element={
              <ProtectedRoute>
                <MainLayout>
                  <ComparePage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App