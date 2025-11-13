/**
 * Token Management Utilities
 */

import { TOKEN_REFRESH_THRESHOLD } from './constants'

/**
 * Decode JWT token (without verification)
 */
export function decodeToken(token: string): { exp?: number; iat?: number } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Check if token is expired or will expire soon
 */
export function isTokenExpiringSoon(token: string | null): boolean {
  if (!token) return true

  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true

  const expirationTime = decoded.exp * 1000 // Convert to milliseconds
  const currentTime = Date.now()
  const timeUntilExpiry = expirationTime - currentTime

  return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true

  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true

  const expirationTime = decoded.exp * 1000
  const currentTime = Date.now()

  return currentTime >= expirationTime
}

