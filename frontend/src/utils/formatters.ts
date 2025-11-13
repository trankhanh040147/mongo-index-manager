/**
 * Formatting Utilities
 */

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format ObjectID for display (truncate if needed)
 */
export function formatObjectId(id: string, length = 8): string {
  if (id.length <= length) return id
  return `${id.substring(0, length)}...`
}

/**
 * Format key signature for display
 */
export function formatKeySignature(keys: Array<{ field: string; value: number }>): string {
  return keys.map((key) => `${key.field}_${key.value}`).join('_')
}

