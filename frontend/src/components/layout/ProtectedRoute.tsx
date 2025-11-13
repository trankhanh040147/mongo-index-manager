/**
 * Protected Route Component
 */

import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'
import { authApi } from '../../api/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, accessToken, user } = useAuthStore()
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // If we have tokens but no user, try to get profile
      if (accessToken && !user) {
        try {
          const response = await authApi.getProfile()
          if (response.data.data) {
            useAuthStore.getState().updateProfile(response.data.data)
          }
        } catch {
          // Profile fetch failed, user will be redirected to login
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [accessToken, user])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

