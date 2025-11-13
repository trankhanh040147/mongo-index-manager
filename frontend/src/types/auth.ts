/**
 * Authentication Types
 */

export interface UserProfile {
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar?: string
}

export interface LoginRequest {
  identity: string // username or email
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  avatar?: string
}

