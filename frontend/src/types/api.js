/**
 * @fileoverview API Response Type Definitions
 * 
 * This file contains JSDoc type definitions for API response structures
 * to match the OpenAPI specification.
 */

/**
 * Base API response structure
 * @template T
 * @typedef {Object} ApiResponse
 * @property {number} status_code - HTTP status code
 * @property {number} error_code - Application error code (0 for success)
 * @property {T} data - Response data
 */

/**
 * Paginated API response structure
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {number} status_code - HTTP status code
 * @property {number} error_code - Application error code (0 for success)
 * @property {T[]} data - Array of response data items
 * @property {PaginationMetadata} extra - Pagination metadata
 */

/**
 * Pagination metadata
 * @typedef {Object} PaginationMetadata
 * @property {number} limit - Number of items per page
 * @property {number} page - Current page number
 * @property {number|null} total - Total number of items (null if unknown)
 */

/**
 * Error API response structure
 * @typedef {Object} ErrorResponse
 * @property {number} status_code - HTTP status code
 * @property {number} error_code - Application error code
 * @property {string|Object} error - Error message or validation errors object
 */

/**
 * Auth Login Response
 * @typedef {ApiResponse<AuthLoginData>} AuthLoginResponse
 */

/**
 * @typedef {Object} AuthLoginData
 * @property {string} access_token - JWT access token
 * @property {string} refresh_token - JWT refresh token
 */

/**
 * Auth Register Response
 * @typedef {ApiResponse<AuthRegisterData>} AuthRegisterResponse
 */

/**
 * @typedef {Object} AuthRegisterData
 * @property {boolean} success - Registration success flag
 */

/**
 * Auth Profile Response
 * @typedef {ApiResponse<AuthProfileData>} AuthProfileResponse
 */

/**
 * @typedef {Object} AuthProfileData
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} first_name - First name
 * @property {string} last_name - Last name
 * @property {string} avatar - Avatar URL
 */

/**
 * Auth Refresh Token Response
 * @typedef {AuthLoginResponse} AuthRefreshTokenResponse
 */

/**
 * Database Create Response
 * @typedef {ApiResponse<DatabaseCreateData>} DatabaseCreateResponse
 */

/**
 * @typedef {Object} DatabaseCreateData
 * @property {string} id - Database ObjectID
 */

/**
 * Database Get Response
 * @typedef {ApiResponse<DatabaseData>} DatabaseGetResponse
 */

/**
 * Database List Response
 * @typedef {PaginatedResponse<DatabaseListItem>} DatabaseListResponse
 */

/**
 * @typedef {Object} DatabaseListItem
 * @property {string} id - Database ObjectID
 * @property {string} created_at - Creation timestamp (ISO 8601)
 * @property {string} updated_at - Update timestamp (ISO 8601)
 * @property {string} name - Database connection name
 * @property {string} description - Database description
 * @property {string} uri - MongoDB connection URI
 * @property {string} db_name - Database name
 */

/**
 * @typedef {DatabaseListItem} DatabaseData
 */

/**
 * Database Update Response
 * @typedef {ApiResponse<DatabaseUpdateData>} DatabaseUpdateResponse
 */

/**
 * @typedef {Object} DatabaseUpdateData
 * @property {boolean} success - Update success flag
 */

/**
 * Index Create Response
 * @typedef {ApiResponse<IndexCreateData>} IndexCreateResponse
 */

/**
 * @typedef {Object} IndexCreateData
 * @property {string} id - Index ObjectID
 */

/**
 * Index Get Response
 * @typedef {ApiResponse<IndexData>} IndexGetResponse
 */

/**
 * Index List Response
 * @typedef {PaginatedResponse<IndexListItem>} IndexListResponse
 */

/**
 * @typedef {Object} IndexListItem
 * @property {string} id - Index ObjectID
 * @property {string} database_id - Database ObjectID
 * @property {string} created_at - Creation timestamp (ISO 8601)
 * @property {string} updated_at - Update timestamp (ISO 8601)
 * @property {string} collection - Collection name
 * @property {string} name - Index name
 * @property {string} key_signature - Index key signature
 * @property {IndexOption} options - Index options
 * @property {IndexKey[]} keys - Array of index keys
 */

/**
 * @typedef {IndexListItem} IndexData
 */

/**
 * @typedef {Object} IndexKey
 * @property {string} field - Field name
 * @property {1|-1} value - Sort order (1 for ascending, -1 for descending)
 */

/**
 * @typedef {Object} IndexOption
 * @property {number|null} expire_after_seconds - TTL in seconds (null if not set)
 * @property {boolean} is_unique - Whether the index is unique
 */

/**
 * Index Update Response
 * @typedef {ApiResponse<IndexUpdateData>} IndexUpdateResponse
 */

/**
 * @typedef {Object} IndexUpdateData
 * @property {boolean} success - Update success flag
 */

/**
 * Index Compare Response
 * @typedef {PaginatedResponse<IndexCompareCollectionResult>} IndexCompareResponse
 */

/**
 * @typedef {Object} IndexCompareCollectionResult
 * @property {string} collection - Collection name
 * @property {IndexCompareItem[]} missing_indexes - Indexes in manager but not in database
 * @property {IndexCompareItem[]} matched_indexes - Indexes that exist in both
 * @property {IndexCompareItem[]} redundant_indexes - Indexes in database but not in manager
 */

/**
 * @typedef {Object} IndexCompareItem
 * @property {string} name - Index name
 * @property {IndexKey[]} keys - Array of index keys
 * @property {IndexOption} options - Index options
 */

/**
 * Index Sync Response
 * @typedef {ApiResponse<IndexSyncData>} IndexSyncResponse
 */

/**
 * @typedef {Object} IndexSyncData
 * @property {boolean} success - Sync success flag
 */

/**
 * Index Sync Status Response
 * @typedef {ApiResponse<IndexSyncStatusData>} IndexSyncStatusResponse
 */

/**
 * @typedef {Object} IndexSyncStatusData
 * @property {string} id - Sync operation ObjectID
 * @property {string} database_id - Database ObjectID
 * @property {string} status - Sync status (pending, processing, completed, failed)
 * @property {number} progress - Progress percentage (0-100)
 * @property {string|null} error - Error message (null if no error)
 * @property {string[]} collections - Array of collection names
 * @property {boolean} is_finished - Whether sync is finished
 * @property {string} started_at - Start timestamp (ISO 8601)
 * @property {string|null} completed_at - Completion timestamp (ISO 8601, null if not completed)
 * @property {string} created_at - Creation timestamp (ISO 8601)
 * @property {string} updated_at - Update timestamp (ISO 8601)
 */

/**
 * Index Sync Status List Response
 * @typedef {PaginatedResponse<IndexSyncStatusListItem>} IndexSyncStatusListResponse
 */

/**
 * @typedef {Object} IndexSyncStatusListItem
 * @property {string} id - Sync operation ObjectID
 * @property {string} status - Sync status
 * @property {number} progress - Progress percentage (0-100)
 * @property {string|null} error - Error message (null if no error)
 * @property {boolean} is_finished - Whether sync is finished
 * @property {string} started_at - Start timestamp (ISO 8601)
 * @property {string|null} completed_at - Completion timestamp (ISO 8601, null if not completed)
 * @property {string} created_at - Creation timestamp (ISO 8601)
 */
