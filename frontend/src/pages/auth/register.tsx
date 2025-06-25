import { Navigate } from 'react-router-dom'
import { RegisterForm } from '@/components/auth/register-form'
import { useAuthStore } from '@/stores/auth-store'

export function RegisterPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <RegisterForm />
    </div>
  )
}