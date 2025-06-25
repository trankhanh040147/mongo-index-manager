import { useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/login-form'
import { useAuthStore } from '@/stores/auth-store'

export function LoginPage() {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const message = location.state?.message

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        {message && (
          <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {message}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  )
}