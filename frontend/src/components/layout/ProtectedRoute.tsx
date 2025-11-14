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
            // Ensure isAuthenticated is set if we have tokens
            if (!useAuthStore.getState().isAuthenticated) {
              useAuthStore.setState({ isAuthenticated: true })
            }
          }
        } catch {
          // Profile fetch failed, clear auth state
          useAuthStore.getState().logout()
        }
      } else if (!accessToken) {
        // No token, ensure not authenticated
        if (useAuthStore.getState().isAuthenticated) {
          useAuthStore.getState().logout()
        }
      } else if (accessToken && user) {
        // Have both token and user, ensure authenticated
        if (!useAuthStore.getState().isAuthenticated) {
          useAuthStore.setState({ isAuthenticated: true })
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

  // Check both isAuthenticated flag and accessToken presence
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

