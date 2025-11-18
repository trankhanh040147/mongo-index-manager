/**
 * Zod Validation Schemas
 */

import { z } from 'zod'

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  identity: z
    .string()
    .min(1, 'Username or email is required')
    .max(255, 'Username or email is too long'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Register form validation schema
 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  last_name: z
    .string()
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

/**
 * MongoDB URI validation schema
 */
export const mongoUriSchema = z
  .string()
  .min(1, 'MongoDB URI is required')
  .refine(
    (uri) => {
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
    },
    {
      message: 'Please enter a valid MongoDB URI',
    }
  )

/**
 * Database form validation schema
 */
export const databaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Database name is required')
    .max(100, 'Database name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  uri: mongoUriSchema,
  db_name: z
    .string()
    .min(1, 'Database name is required')
    .max(100, 'Database name must be less than 100 characters'),
  is_test_connection: z.boolean().optional(),
  is_sync_index: z.boolean().optional(),
})

export type DatabaseFormData = z.infer<typeof databaseSchema>

/**
 * Index key validation schema
 */
export const indexKeySchema = z.object({
  field: z
    .string()
    .min(1, 'Field name is required')
    .max(100, 'Field name is too long')
    .refine((field) => field !== '_id', {
      message: "Field cannot be '_id'",
    }),
  value: z.union([z.literal(1), z.literal(-1)]),
})

/**
 * Index form validation schema
 */
export const indexSchema = z
  .object({
    database_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid database ID'),
    collection: z
      .string()
      .min(1, 'Collection name is required')
      .max(100, 'Collection name is too long'),
    name: z
      .string()
      .max(100, 'Index name must be less than 100 characters')
      .refine((name) => name !== '_id_', {
        message: "Index name cannot be '_id_'",
      })
      .optional()
      .or(z.literal('')),
    options: z
      .object({
        expire_after_seconds: z
          .number()
          .int()
          .min(0, 'TTL must be 0 or greater')
          .optional()
          .nullable(),
        is_unique: z.boolean().optional(),
      })
      .optional(),
    keys: z
      .array(indexKeySchema)
      .min(1, 'At least one key is required')
      .refine(
        (keys) => {
          const fields = keys.map((k) => k.field)
          return new Set(fields).size === fields.length
        },
        {
          message: 'Duplicate fields are not allowed',
        }
      ),
  })
  .refine(
    (data) => {
      // If TTL is set, only single key is allowed
      if (
        data.options?.expire_after_seconds !== null &&
        data.options?.expire_after_seconds !== undefined &&
        data.keys.length > 1
      ) {
        return false
      }
      return true
    },
    {
      message: 'TTL indexes can only have a single key',
      path: ['options', 'expire_after_seconds'],
    }
  )

export type IndexFormData = z.infer<typeof indexSchema>




