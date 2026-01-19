# Roadmap

## v0.1.0 - Current Implementation

### Authentication

- [x] Login (`/auth/login`)
- [x] Register (`/auth/register`)
- [x] Get Profile (`/profile`)
- [x] Update Profile (`/profile` PUT)
- [x] Forgot Password (`/auth/forgot-password`)

### Database Management

- [x] Create Database (`POST /databases`)
- [x] List Databases (`GET /databases`)
- [x] Update Database (`PUT /databases/{id}`)
- [x] Delete Database (`DELETE /databases/{id}`)
- [x] Database connection test on create/update

### Index Management

- [x] Create Index (`POST /indexes`)
- [x] Update Index (`PUT /indexes/{id}`)
- [x] Delete Index (`DELETE /indexes/{id}`)
- [x] List Indexes by Collection (`GET /indexes`)
- [x] Index options: unique, expire_after_seconds

### Index Comparison

- [x] Compare by Collection (`POST /indexes/comparing/collection`)
- [x] Compare by Database (`POST /indexes/comparing/database`)
- [x] Display missing/matched/redundant indexes

### Index Synchronization

- [x] Sync by Collection (`POST /indexes/syncing/collection`)
- [x] Sync by Database (`POST /indexes/syncing/database`)
- [x] Sync options UI (option_missing, option_extra)
- [x] Sync history display (`GET /syncing`)

### UI Pages

- [x] Database List page
- [x] Collection List page
- [x] Index List page
- [x] Compare Indexes page
- [x] Create/Edit Database forms
- [x] Create/Edit Index forms

---

## v0.2.0 - Alignment & Missing Features

### A. Mismatches vs Backend (OpenAPI)

#### Response Structure Analysis

- [x] Analysis completed and documented

**Current FE Response Handling:**
- Axios interceptor returns `response.data` (unwraps axios response)
- Thunks access `resp.data` (expects `{data: {...}}` structure)
- Pagination: FE uses `paging` object, BE spec uses `extra` object
- Compare by database: FE accesses `resp.data.result` (inconsistent)

**OpenAPI Spec Response Format:**
- Success: `{status_code, error_code, data}`
- Pagination: `{status_code, error_code, data[], extra: {limit, page, total}}`
- Error: `{status_code, error_code, error}`

**Mismatches Found:**
- [x] Response wrapper: FE expects `{data}`, BE returns `{status_code, error_code, data}`
- [x] Pagination: FE uses `paging`, BE spec uses `extra`
- [x] Error format: FE expects `error.response.data.message`, BE returns `{error}`
- [x] Compare response: FE accesses `.result`, not in spec

#### TypeScript Response Types

- [x] Define base response types (documented in roadmap):
  ```typescript
  interface ApiResponse<T> {
    status_code: number;
    error_code: number;
    data: T;
  }
  
  interface PaginatedResponse<T> {
    status_code: number;
    error_code: number;
    data: T[];
    extra: {
      limit: number;
      page: number;
      total: number | null;
    };
  }
  
  interface ErrorResponse {
    status_code: number;
    error_code: number;
    error: string | object;
  }
  ```

- [x] Define Auth response types (documented in roadmap):
  - `AuthLoginResponse`, `AuthRegisterResponse`, `AuthProfileResponse`, `AuthRefreshTokenResponse`

- [x] Define Database response types (documented in roadmap):
  - `DatabaseCreateResponse`, `DatabaseGetResponse`, `DatabaseListResponse`, `DatabaseUpdateResponse`

- [x] Define Index response types (documented in roadmap):
  - `IndexCreateResponse`, `IndexGetResponse`, `IndexListResponse`, `IndexUpdateResponse`, `IndexCompareResponse`

- [x] Define Sync response types (documented in roadmap):
  - `IndexSyncResponse`, `IndexSyncStatusResponse`, `IndexSyncStatusListResponse`

- [ ] Update thunks to use typed responses
- [ ] Fix response handling to match OpenAPI spec structure

#### Endpoint Mismatches

**Authentication:**
- [ ] Refresh Token endpoint (`/auth/refresh-token`) - FE missing
- [ ] Profile endpoint mismatch: FE uses `/profile`, BE expects `/auth/profile`

**Database:**
- [ ] List endpoint mismatch: FE uses `GET /databases`, BE expects `POST /databases/list`
- [ ] Get Database by ID (`GET /databases/{id}`) - FE missing
- [ ] List Collections (`POST /databases/collections/list`) - FE missing

**Index:**
- [ ] List endpoint mismatch: FE uses `GET /indexes`, BE expects `POST /indexes/list-by-collection`
- [ ] Get Index by ID (`GET /indexes/{id}`) - FE missing
- [ ] Compare endpoints mismatch:
  - FE: `/indexes/comparing/collection` → BE: `/indexes/compare-by-collections`
  - FE: `/indexes/comparing/database` → BE: `/indexes/compare-by-database`
- [ ] Sync endpoints mismatch:
  - FE: `/indexes/syncing/collection` → BE: `/indexes/sync-by-collections`
  - FE: `/indexes/syncing/database` → BE: `/indexes/sync-by-database`

**Sync Status:**
- [ ] Sync status endpoint mismatch: FE uses `GET /syncing`, BE expects `GET /indexes/sync-status/by-database/{database_id}`
- [ ] Get sync status by sync ID (`GET /indexes/sync-status/{sync_id}`) - FE missing

**Import/Export:**
- [ ] Export indexes (`POST /indexes/export`) - FE has but endpoint may differ
- [ ] Import indexes (`POST /indexes/{database_id}/import`) - FE has but endpoint may differ

---

### B. Missing from Frontend

#### Authentication
- [ ] Refresh token handling (auto-refresh on 401)
- [ ] Token expiration detection
- [ ] Logout on token expiry

#### Database
- [ ] Get single database details view
- [ ] List collections with index counts
- [ ] Database connection validation UI feedback

#### Index
- [ ] View single index details
- [ ] Index key signature display
- [ ] Index creation timestamp display

#### Sync
- [ ] Sync from Database (`POST /indexes/sync-from-database`) - import indexes from DB to manager
- [ ] Sync status polling for active syncs
- [ ] Sync progress indicator (progress percentage)
- [ ] Sync error details display
- [ ] Individual sync status view by sync_id

#### UI/UX
- [ ] Loading states for async operations
- [ ] Error boundary for API errors
- [ ] Pagination for large lists
- [ ] Search/filter functionality
- [ ] Bulk operations

---

### C. Missing from Backend

#### Sync Options
- [ ] Sync options support (`option_missing`, `option_extra`) in sync endpoints
- FE sends: `option_missing` (1=forward, 2=backward), `option_extra` (1=forward, 2=backward)
- BE: Not in OpenAPI spec for sync endpoints

#### Database
- [ ] `is_sync_index` flag support in DatabaseCreateRequest
- FE sends `is_sync` flag but BE may not handle it

#### Response Format
- [ ] Consistent error response format
- FE expects `error.response.data.message`, verify BE returns this

#### Sync Status
- [ ] Sync status response format alignment
- FE expects: `{records: [...], completed_tasks, total_tasks, database_name, collection_name}`
- BE spec shows: `{id, status, progress, error, collections, is_finished, started_at, completed_at}`
- Need alignment

---

## v0.3.0 - Backend Implementation

### Sync Options Support

- [ ] Add `option_missing` parameter to sync endpoints
  - Type: integer (1=forward/add to DB, 2=backward/add to manager)
  - Endpoints: `/indexes/sync-by-collections`, `/indexes/sync-by-database`
  - Update OpenAPI spec

- [ ] Add `option_extra` parameter to sync endpoints
  - Type: integer (1=forward/remove from DB, 2=backward/add to manager)
  - Endpoints: `/indexes/sync-by-collections`, `/indexes/sync-by-database`
  - Update OpenAPI spec

- [ ] Implement sync logic based on options:
  - `option_missing=1`: Create missing indexes in database
  - `option_missing=2`: Import missing indexes to manager
  - `option_extra=1`: Remove redundant indexes from database
  - `option_extra=2`: Add redundant indexes to manager

### Database Creation Enhancement

- [ ] Add `is_sync_index` flag to `DatabaseCreateRequest`
  - Type: boolean
  - Default: false
  - If true, automatically sync indexes after database creation
  - Update OpenAPI spec

### Sync Status Response Alignment

- [ ] Align sync status response with FE expectations
  - Current BE spec: `{id, status, progress, error, collections, is_finished, started_at, completed_at}`
  - FE expects: `{records: [...], completed_tasks, total_tasks, database_name, collection_name}`
  - Decision: Update BE to match FE OR update FE to match BE spec
  - Update OpenAPI spec accordingly

### Error Response Standardization

- [ ] Ensure all error responses follow OpenAPI spec:
  ```json
  {
    "status_code": 400,
    "error_code": 0,
    "error": "Error message or validation errors"
  }
  ```

- [ ] Verify `error.response.data.message` compatibility (may need adapter)

### Response Wrapper Consistency

- [ ] Ensure all responses include `status_code` and `error_code`
- [ ] Verify pagination uses `extra` object (not `paging`)
- [ ] Remove inconsistent `.result` wrapper in compare responses

---

## Notes

- Base path: All endpoints should use `/api/doctor-manager-api/v1` prefix
- Sync options constants: `OptionSyncForward=1`, `OptionSyncBackward=2`, `OptionKeeping=0`
- FE currently uses different URL patterns than OpenAPI spec
- Sync operations are async - need polling mechanism for status updates
