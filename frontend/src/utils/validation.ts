/**
 * Validation Utilities
 */

/**
 * Validate MongoDB ObjectID format (24 hex characters)
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Validate MongoDB URI format
 */
export function isValidMongoUri(uri: string): boolean {
  try {
    const url = new URL(uri)
    return (
      url.protocol === 'mongodb:' ||
      url.protocol === 'mongodb+srv:' ||
      uri.startsWith('mongodb://') ||
      uri.startsWith('mongodb+srv://')
    )
  } catch {
    return false
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

