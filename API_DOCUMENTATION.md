# MongoDB Index Manager API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Pagination](#pagination)
7. [API Endpoints](#api-endpoints)
   - [Authentication APIs](#authentication-apis)
   - [Database APIs](#database-apis)
   - [Index APIs](#index-apis)

---

## Overview

This API provides endpoints for managing MongoDB databases and their indexes. The API uses JWT-based authentication with access tokens and refresh tokens.

**Base Path:** `/api/doctor-manager-api/v1`

**Content-Type:** `application/json`

---

## Base URL

All API endpoints are prefixed with:
```
/api/doctor-manager-api/v1
```

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. There are two types of tokens:

- **Access Token**: Used for authenticated requests (short-lived, default: 10 minutes)
- **Refresh Token**: Used to obtain new access tokens (long-lived, default: 24 hours)

### Token Format

All authenticated requests must include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Types

- **Bearer**: Default token type (configured via `TOKEN_TYPE` environment variable)

---

## Response Format

### Success Response

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": { ... }
}
```

### Success Response with Pagination

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": [ ... ],
  "extra": {
    "limit": 10,
    "page": 1,
    "total": 100
  }
}
```

### Error Response

```json
{
  "status_code": 400,
  "error_code": 0,
  "error": "Error message or validation errors"
}
```

---

## Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate name)
- `412 Precondition Failed`: Precondition failed (e.g., cannot connect to database)
- `500 Internal Server Error`: Server error

### Common Error Messages

- `"Token is required"`: Missing Authorization header
- `"Token is wrong format"`: Invalid token format
- `"Token is wrong"`: Invalid or expired token
- `"Token is revoked"`: Token has been revoked
- `"Resource not found"`: Requested resource doesn't exist
- `"Resource conflict"`: Resource already exists (e.g., duplicate name)
- `"Field wrong type"`: Invalid data type in request body
- `"URL not found"`: Endpoint doesn't exist

---

## Pagination

List endpoints support pagination with the following parameters:

- `page` (int64, optional): Page number (default: 1, minimum: 1)
- `limit` (int64, optional): Items per page (default: 50, maximum: 50)

**Note:** If `limit` exceeds the maximum (50), it will be automatically set to the maximum value.

### Pagination Response

Pagination metadata is included in the `extra` field:

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": [ ... ],
  "extra": {
    "limit": 10,
    "page": 1,
    "total": 100
  }
}
```

---

## API Endpoints

---

## Authentication APIs

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** Not required

**Request Body:**

```json
{
  "username": "string (required)",
  "email": "string (required, valid email format)",
  "password": "string (required, minimum 8 characters)"
}
```

**Response:** `201 Created`

```json
{
  "status_code": 201,
  "error_code": 0,
  "data": {
    "success": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Username or email already exists

---

### Login

Authenticate user and receive access and refresh tokens.

**Endpoint:** `POST /auth/login`

**Authentication:** Not required

**Request Body:**

```json
{
  "identity": "string (required, username or email)",
  "password": "string (required)"
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "access_token": "string",
    "refresh_token": "string"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid credentials or validation errors
- `404 Not Found`: User not found

---

### Refresh Token

Obtain new access and refresh tokens using a valid refresh token.

**Endpoint:** `POST /auth/refresh-token`

**Authentication:** Required (Refresh Token)

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Request Body:** None

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "access_token": "string",
    "refresh_token": "string"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token

---

### Get Profile

Get the authenticated user's profile information.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "avatar": "string"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired access token

---

### Update Profile

Update the authenticated user's profile information.

**Endpoint:** `PUT /auth/profile`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "avatar": "string (optional)"
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "success": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired access token

---

## Database APIs

### Create Database

Create a new database connection configuration.

**Endpoint:** `POST /databases/`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "uri": "string (required, valid MongoDB URI)",
  "db_name": "string (required)",
  "is_test_connection": "boolean (optional, default: false)",
  "is_sync_index": "boolean (optional, default: false)"
}
```

**Response:** `201 Created`

```json
{
  "status_code": 201,
  "error_code": 0,
  "data": {
    "id": "ObjectID"
  }
}
```

**Notes:**
- `is_test_connection`: If `true`, validates the connection before creating
- `is_sync_index`: If `true`, automatically syncs indexes from the database

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Database name already exists
- `412 Precondition Failed`: Cannot connect to database (when `is_test_connection` is true)

---

### Get Database

Get database details by ID.

**Endpoint:** `GET /databases/:id`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (string, required): Database ObjectID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "id": "ObjectID",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime",
    "name": "string",
    "description": "string",
    "uri": "string",
    "db_name": "string"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired access token
- `404 Not Found`: Database not found

---

### List Databases

Get a paginated list of databases with optional search.

**Endpoint:** `POST /databases/list`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "query": "string (optional, max 500 characters)",
  "page": "int64 (optional, minimum: 0)",
  "limit": "int64 (optional, minimum: 0)"
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": [
    {
      "id": "ObjectID",
      "created_at": "ISO 8601 datetime",
      "updated_at": "ISO 8601 datetime",
      "name": "string",
      "description": "string",
      "uri": "string",
      "db_name": "string"
    }
  ],
  "extra": {
    "limit": 10,
    "page": 1,
    "total": 100
  }
}
```

**Notes:**
- If `query` is a valid ObjectID, returns that specific database
- Otherwise, searches databases by name/description

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired access token

---

### Update Database

Update database connection configuration.

**Endpoint:** `PUT /databases/:id/`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (string, required): Database ObjectID

**Request Body:**

```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "uri": "string (required, valid MongoDB URI)",
  "db_name": "string (required)",
  "is_test_connection": "boolean (optional, default: false)"
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "success": true
  }
}
```

**Notes:**
- `is_test_connection`: If `true` and URI changed, validates the new connection

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired access token
- `404 Not Found`: Database not found
- `409 Conflict`: Database name already exists
- `412 Precondition Failed`: Cannot connect to database (when `is_test_connection` is true)

---

### Delete Database

Delete a database configuration and all associated indexes.

**Endpoint:** `DELETE /databases/:id/`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (string, required): Database ObjectID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "success": true
  }
}
```

**Notes:**
- Also deletes all indexes associated with this database
- Returns success even if database doesn't exist

**Error Responses:**
- `401 Unauthorized`: Invalid or expired access token

---

### List Collections

Get a paginated list of collections for a database with index counts.

**Endpoint:** `POST /databases/collections/list`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "database_id": "ObjectID (required)",
  "query": "string (optional)",
  "page": "int64 (optional, minimum: 0)",
  "limit": "int64 (optional, minimum: 0)"
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": [
    {
      "collection": "string",
      "total_indexes": "integer"
    }
  ],
  "extra": {
    "limit": 10,
    "page": 1,
    "total": 50
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired access token
- `404 Not Found`: Database not found

---

## Index APIs

### Create Index

Create a new index definition.

**Endpoint:** `POST /indexes/`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "database_id": "ObjectID (required)",
  "collection": "string (required)",
  "name": "string (optional, max 100 characters, cannot be '_id_')",
  "options": {
    "expire_after_seconds": "int32 (optional, >= 0)",
    "is_unique": "boolean (optional, default: false)"
  },
  "keys": [
    {
      "field": "string (required, cannot be '_id')",
      "value": "integer (required, must be 1 or -1)"
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "status_code": 201,
  "error_code": 0,
  "data": {
    "id": "ObjectID"
  }
}
```

**Notes:**
- `keys`: Array of index keys (minimum 1, unique fields)
- `value`: `1` for ascending, `-1` for descending
- If `name` is empty, it will be auto-generated from key signature
- If `expire_after_seconds` is set, only single-key indexes are allowed
- If `is_unique` is `true`, checks for duplicate unique indexes on the same fields

**Error Responses:**
- `400 Bad Request`: Validation errors (e.g., TTL with compound index)
- `401 Unauthorized`: Invalid or expired access token
- `404 Not Found`: Database not found
- `409 Conflict`: Index with same name or key signature already exists, or duplicate unique index

---

### Get Index

Get index details by ID.

**Endpoint:** `GET /indexes/:id`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (string, required): Index ObjectID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "id": "ObjectID",
    "database_id": "ObjectID",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime",
    "collection": "string",
    "name": "string",
    "key_signature": "string",
    "options": {
      "expire_after_seconds": "int32 or null",
      "is_unique": "boolean"
    },
    "keys": [
      {
        "field": "string",
        "value": "integer (1 or -1)"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired access token
- `404 Not Found`: Index not found

---

### List Indexes by Collection

Get a paginated list of indexes for a specific collection.

**Endpoint:** `POST /indexes/list-by-collection`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "database_id": "ObjectID (required)",
  "collection": "string (required)",
  "query": "string (optional)",
  "page": "int64 (optional, minimum: 0)",
  "limit": "int64 (optional, minimum: 0)"
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": [
    {
      "id": "ObjectID",
      "database_id": "ObjectID",
      "created_at": "ISO 8601 datetime",
      "updated_at": "ISO 8601 datetime",
      "collection": "string",
      "name": "string",
      "key_signature": "string",
      "options": {
        "expire_after_seconds": "int32 or null",
        "is_unique": "boolean"
      },
      "keys": [
        {
          "field": "string",
          "value": "integer (1 or -1)"
        }
      ]
    }
  ],
  "extra": {
    "limit": 10,
    "page": 1,
    "total": 50
  }
}
```

**Notes:**
- If `query` is a valid ObjectID, returns that specific index
- Otherwise, searches indexes by name/key signature

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired access token

---

### Update Index

Update an existing index definition.

**Endpoint:** `PUT /indexes/:id`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (string, required): Index ObjectID

**Request Body:**

```json
{
  "name": "string (optional, max 100 characters, cannot be '_id_')",
  "options": {
    "expire_after_seconds": "int32 (optional, >= 0)",
    "is_unique": "boolean (optional, default: false)"
  },
  "keys": [
    {
      "field": "string (required, cannot be '_id')",
      "value": "integer (required, must be 1 or -1)"
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "success": true
  }
}
```

**Notes:**
- If `name` is empty, it will be auto-generated from key signature
- If `expire_after_seconds` is set, only single-key indexes are allowed
- Checks for conflicts with existing indexes

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired access token
- `404 Not Found`: Index not found
- `409 Conflict`: Index with same name or key signature already exists, or duplicate unique index

---

### Delete Index

Delete an index definition.

**Endpoint:** `DELETE /indexes/:id`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (string, required): Index ObjectID

**Request Body:** None

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "success": true
  }
}
```

**Notes:**
- Returns success even if index doesn't exist

**Error Responses:**
- `401 Unauthorized`: Invalid or expired access token

---

### Compare Indexes by Collections

Compare indexes in the manager with indexes in the actual MongoDB database for specific collections.

**Endpoint:** `POST /indexes/compare-by-collections`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "database_id": "ObjectID (required)",
  "collections": [
    "string (required, minimum 1, unique)"
  ]
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": [
    {
      "collection": "string",
      "missing_indexes": [
        {
          "name": "string",
          "keys": [
            {
              "field": "string",
              "value": "integer (1 or -1)"
            }
          ],
          "options": {
            "expire_after_seconds": "int32 or null",
            "is_unique": "boolean"
          }
        }
      ],
      "matched_indexes": [
        {
          "name": "string",
          "keys": [
            {
              "field": "string",
              "value": "integer (1 or -1)"
            }
          ],
          "options": {
            "expire_after_seconds": "int32 or null",
            "is_unique": "boolean"
          }
        }
      ],
      "redundant_indexes": [
        {
          "name": "string",
          "keys": [
            {
              "field": "string",
              "value": "integer (1 or -1)"
            }
          ],
          "options": {
            "expire_after_seconds": "int32 or null",
            "is_unique": "boolean"
          }
        }
      ]
    }
  ],
  "extra": {
    "limit": 0,
    "page": 0,
    "total": null
  }
}
```

**Notes:**
- `missing_indexes`: Indexes in manager but not in database
- `matched_indexes`: Indexes that exist in both manager and database
- `redundant_indexes`: Indexes in database but not in manager
- Requires valid database connection

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired access token
- `404 Not Found`: Database not found
- `412 Precondition Failed`: Cannot connect to database or cannot get indexes

---

### Compare Indexes by Database

Compare all indexes in the manager with indexes in the actual MongoDB database.

**Endpoint:** `POST /indexes/compare-by-database`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "database_id": "ObjectID (required)"
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": [
    {
      "collection": "string",
      "missing_indexes": [
        {
          "name": "string",
          "keys": [
            {
              "field": "string",
              "value": "integer (1 or -1)"
            }
          ],
          "options": {
            "expire_after_seconds": "int32 or null",
            "is_unique": "boolean"
          }
        }
      ],
      "matched_indexes": [
        {
          "name": "string",
          "keys": [
            {
              "field": "string",
              "value": "integer (1 or -1)"
            }
          ],
          "options": {
            "expire_after_seconds": "int32 or null",
            "is_unique": "boolean"
          }
        }
      ],
      "redundant_indexes": [
        {
          "name": "string",
          "keys": [
            {
              "field": "string",
              "value": "integer (1 or -1)"
            }
          ],
          "options": {
            "expire_after_seconds": "int32 or null",
            "is_unique": "boolean"
          }
        }
      ]
    }
  ],
  "extra": {
    "limit": 0,
    "page": 0,
    "total": null
  }
}
```

**Notes:**
- Compares all collections that have indexes in the manager
- Same comparison logic as `compare-by-collections` but for all collections
- Requires valid database connection

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired access token
- `404 Not Found`: Database not found
- `412 Precondition Failed`: Cannot connect to database or cannot get indexes

---

### Sync Indexes by Collections

Synchronize indexes from the manager to the actual MongoDB database for specific collections (async operation).

**Endpoint:** `POST /indexes/sync-by-collections`

**Authentication:** Required (Access Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "database_id": "ObjectID (required)",
  "collections": [
    "string (required, minimum 1, unique)"
  ]
}
```

**Response:** `200 OK`

```json
{
  "status_code": 200,
  "error_code": 0,
  "data": {
    "success": true
  }
}
```

**Notes:**
- This is an asynchronous operation that runs in the background
- Creates missing indexes in the database
- Removes redundant indexes from the database
- Returns immediately after queuing the sync job
- Cannot start a new sync if one is already in progress for the database
- Check sync status separately (sync status tracking not documented in current API)

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired access token
- `404 Not Found`: Database not found
- `409 Conflict`: Sync already in progress for this database
- `412 Precondition Failed`: Cannot connect to database or cannot get indexes
- `500 Internal Server Error`: Failed to queue sync job

---

## Data Types

### ObjectID

MongoDB ObjectID represented as a 24-character hexadecimal string (e.g., `"507f1f77bcf86cd799439011"`).

### DateTime

ISO 8601 formatted datetime string (e.g., `"2024-01-15T10:30:00Z"`).

### Index Key Value

- `1`: Ascending order
- `-1`: Descending order

### MongoDB URI

Valid MongoDB connection URI format (e.g., `"mongodb://localhost:27017"` or `"mongodb://user:password@host:port/database"`).

---

## Example Usage

### Complete Authentication Flow

```javascript
// 1. Register
const registerResponse = await fetch('/api/doctor-manager-api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'securepassword123'
  })
});

// 2. Login
const loginResponse = await fetch('/api/doctor-manager-api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identity: 'john_doe',
    password: 'securepassword123'
  })
});
const { data: { access_token, refresh_token } } = await loginResponse.json();

// 3. Use access token for authenticated requests
const profileResponse = await fetch('/api/doctor-manager-api/v1/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

// 4. Refresh token when access token expires
const refreshResponse = await fetch('/api/doctor-manager-api/v1/auth/refresh-token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${refresh_token}`
  }
});
```

### Database Management Flow

```javascript
// 1. Create database
const createDbResponse = await fetch('/api/doctor-manager-api/v1/databases/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    name: 'Production DB',
    description: 'Main production database',
    uri: 'mongodb://localhost:27017',
    db_name: 'myapp',
    is_test_connection: true,
    is_sync_index: true
  })
});

// 2. List databases
const listDbResponse = await fetch('/api/doctor-manager-api/v1/databases/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    page: 1,
    limit: 10,
    query: '' // optional search query
  })
});

// 3. Get collections
const collectionsResponse = await fetch('/api/doctor-manager-api/v1/databases/collections/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    database_id: '507f1f77bcf86cd799439011',
    page: 1,
    limit: 20
  })
});
```

### Index Management Flow

```javascript
// 1. Create index
const createIndexResponse = await fetch('/api/doctor-manager-api/v1/indexes/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    database_id: '507f1f77bcf86cd799439011',
    collection: 'users',
    name: 'idx_email',
    options: {
      is_unique: true
    },
    keys: [
      { field: 'email', value: 1 }
    ]
  })
});

// 2. List indexes by collection
const listIndexesResponse = await fetch('/api/doctor-manager-api/v1/indexes/list-by-collection', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    database_id: '507f1f77bcf86cd799439011',
    collection: 'users',
    page: 1,
    limit: 10
  })
});

// 3. Compare indexes
const compareResponse = await fetch('/api/doctor-manager-api/v1/indexes/compare-by-collections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    database_id: '507f1f77bcf86cd799439011',
    collections: ['users', 'orders']
  })
});

// 4. Sync indexes
const syncResponse = await fetch('/api/doctor-manager-api/v1/indexes/sync-by-collections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    database_id: '507f1f77bcf86cd799439011',
    collections: ['users', 'orders']
  })
});
```

---

## Notes

1. **Token Expiration**: Access tokens expire after 10 minutes (configurable). Use refresh tokens to obtain new access tokens.

2. **Pagination**: Default pagination limit is 50 items per page. Maximum limit is 50.

3. **Index Key Signature**: When an index name is not provided, it's auto-generated from the key signature (combination of fields and sort orders).

4. **TTL Indexes**: TTL (Time To Live) indexes (`expire_after_seconds`) can only be created on single-field indexes, not compound indexes.

5. **Unique Indexes**: Only one unique index can exist per collection for the same set of fields.

6. **Sync Operations**: Index synchronization runs asynchronously in the background. Only one sync can run per database at a time.

7. **Database URI Validation**: The `databaseUri` validator ensures the URI format is correct. Common formats:
   - `mongodb://localhost:27017`
   - `mongodb://user:password@host:port/database`
   - `mongodb+srv://user:password@cluster.mongodb.net/database`

8. **Error Handling**: Always check the `status_code` in the response. Error details are in the `error` field for error responses.

---

## Version History

- **v1**: Initial API version

---

## Support

For issues or questions, please refer to the project repository or contact the development team.

