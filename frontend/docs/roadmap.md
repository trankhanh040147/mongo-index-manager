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
- [x] Refresh token handling (auto-refresh on 401)
- [x] Token expiration detection
- [x] Logout on token expiry

#### Database
- [x] List collections with index counts

#### Index
- [x] Index key signature display
- [x] Index creation timestamp display

#### Sync
- [x] Sync from Database (`POST /indexes/sync-from-database`) - import indexes from DB to manager
- [x] Sync status polling for active syncs
- [x] Sync progress indicator (progress percentage)
- [x] Sync error details display

#### UI/UX
- [x] Loading states for async operations
- [ ] Error boundary for API errors
- [x] Pagination for large lists
- [ ] Search/filter functionality
- [x] Bulk operations
- [x] Route context guards: prevent API calls / redirect when required context missing (e.g., `/collections` needs current database; `/indexes` needs current database + collection)
- [x] Fix “View Indexes” navigation: ensure selected collection is stored in Redux via `dispatch(collectionActions.setCollection(...))` before navigating to `/indexes` (otherwise backend returns `collection: required`)
- [x] Compare flow bugs: `ChooseCollection` uses wrong request param (`id` vs `database_id`) and wrong selector (`collections.collectionLists` vs `collections.list`) causing missing/empty collections and potential backend validation errors

---

## v0.2.1 - Final Test & Bug Reports

- [x] IS1: Refresh `/collections` or `/indexes` can throw `Cannot read properties of null` when required Redux context is missing
- [x] IS2: Navigating directly to `/compare` shows an empty database list (no databases loaded)
- [x] IS3: Compare-by-collection request uses `collection_name` instead of `collections: string[]` as per `IndexCompareByCollectionsRequest`, causing `collections: required` validation errors
- [x] IS4: Sync-by-collections request uses `collection_name` instead of `collections: string[]` as per `IndexSyncByCollectionsRequest`; FE currently only supports a single collection while spec expects an array
- [x] IS5: Database create request uses `is_sync` instead of `is_sync_index` as per `DatabaseCreateRequest` schema
- [ ] IS6: Collection creation endpoint doesn't exist - FE calls `POST /databases/{id}/collections` but OpenAPI spec has no endpoint for creating collections (collections are MongoDB entities, not manager entities; they should be discovered via `POST /databases/collections/list`, not created)
- [ ] IS7: Collection update endpoint doesn't exist - FE calls `PUT /collections/{id}` but OpenAPI spec has no endpoint for updating collections
- [ ] IS8: Collection delete endpoint doesn't exist - FE calls `DELETE /collections/{id}` but OpenAPI spec has no endpoint for deleting collections

---

## v0.3.0 - Text Index And Collation Support

### A. Enhanced Index Options Support

#### Collation Support
- [x] Add collation fields to index form (`src/pages/Indexes/NewIndex.js`):
  - `locale` (required if collation enabled): Text input with common locale suggestions (en, fr, de, etc.)
  - `strength` (optional): Number input (1-5) with validation
  - `case_level` (optional): Boolean checkbox
  - `case_first` (optional): Select dropdown ("upper", "lower", or empty)
  - `numeric_ordering` (optional): Boolean checkbox
- [x] Update form validation schema to include collation fields
- [x] Update form initial values to load collation from existing index (`index?.options?.collation`)
- [x] Update index thunk (`src/slices/index/thunk.js`) to include collation object in options when provided
- [x] Add collation display in index table (`src/pages/Indexes/IndexTable.js`) - show locale badge or "None"

#### Text Index Support (default_language, weights)
- [x] Add text index fields to index form:
  - `default_language` (optional): Text input for language code (e.g., "english", "french")
  - `weights` (optional): JSON textarea input for field weights (object with field names and numeric weights)
- [x] Update form validation schema for text index fields
- [x] Update form initial values to load text index options from existing index (`index?.options?.default_language`, `index?.options?.weights`)
- [x] Update index thunk to include `default_language` and `weights` in options when provided
- [x] Add text index info display in index table (show language badge or weights summary)

#### Form UX Improvements
- [x] Add collapsible section for "Advanced Options" in index form (collation and text index options)
- [x] Add validation: text indexes cannot have collation (MongoDB constraint)
- [x] Add help text/tooltips explaining collation and text index options
- [x] Add an "Index Type" selector (regular vs text) to show/hide relevant fields

### B. Collection Management

#### Verify Collection Creation
- [x] Collection creation endpoint already matches spec (`POST /databases/collections/`)
- [x] Collection creation UI already exists (`src/pages/Collections/CollectionList/NewCollection.js`)
- [ ] Verify collection creation request format matches `DatabaseCreateCollectionRequest` schema
  - Request should have: `{database_id: ObjectID, collection: string}`
- [ ] Test collection creation with backend v0.3.0

### C. Display Enhancements

#### Index Table Updates
- [x] Add collation column or badge in index table (show locale if present, "None" if not)
- [x] Add text index indicators (show language badge or weights summary if present)
- [x] Update index detail view (if exists) to show all collation and text index options

#### Index List/Display
- [x] Ensure index list response handling includes new option fields (collation, default_language, weights)
- [x] Update any index comparison displays to show collation differences
- [x] Update compare indexes pages to display collation and text index in readable format (replaced JSON.stringify with formatted badges)
- [ ] Update sync status displays if they show index details

### D. Backend Integration

#### API Request Updates
- [x] Update `createIndex` thunk (`src/slices/index/thunk.js`) to send full options object:
  ```javascript
  options: {
    is_unique: boolean,
    expire_after_seconds: number | null,
    collation: { 
      locale: string, 
      strength?: number, 
      case_level?: boolean, 
      case_first?: string, 
      numeric_ordering?: boolean 
    } | null,
    default_language: string | null,
    weights: object | null
  }
  ```
- [x] Update `updateIndex` thunk similarly
- [x] Ensure options object structure matches `IndexOption` schema from OpenAPI spec

#### Response Handling
- [x] Verify index list/get responses include new option fields (collation, default_language, weights)
- [x] Update TypeScript types (if applicable) or add JSDoc comments for new fields
- [x] Test backward compatibility (existing indexes without new fields should still work)

### E. Testing & Validation

- [x] Test index creation with all collation options (locale, strength, case_level, case_first, numeric_ordering)
- [x] Test index creation with text index options (default_language, weights)
- [x] Test validation: text indexes cannot have collation (MongoDB constraint)
- [x] Test index update with new options
- [x] Test index display with new options in table and detail views
- [x] Test backward compatibility with existing indexes (without new fields)
- [ ] Verify collection creation still works with backend v0.3.0

### F. Documentation

- [ ] Update component documentation for new index form fields
- [ ] Add user-facing help text for collation and text index options
- [ ] Document MongoDB constraints (text indexes cannot have collation)

### Notes

- All new fields are optional (backward compatible)
- Collation and text index options are mutually exclusive (MongoDB constraint)
- Collection creation endpoint already implemented correctly (`POST /databases/collections/`)
- Key signature improvements are backend-only (no FE changes needed)
- Backend v0.3.0 adds:
  - `Collation` schema component
  - Enhanced `IndexOption` schema with collation, default_language, weights
  - `POST /databases/collections/` endpoint (already used by FE)

---

## v0.3.1 - Text Index Signature Fix & Validation

### A. Backend v0.3.1 Changes

#### Text Index Detection (`is_text` field)
- Backend now returns `is_text` boolean field in all index responses
- Backend automatically detects text indexes and sets `is_text` when syncing from MongoDB
- Frontend should use `is_text` field when available to determine index type

#### Default Language Handling
- Backend defaults `default_language` to "none" when creating/updating text indexes without explicit default language
- Frontend should send "none" (not null) when creating text indexes without default language

#### Validation Enhancements
- Backend validates that all text fields in keys are present in weights map when weights provided
- Backend validates `default_language` against MongoDB language codes (ISO 639-1 + "none")
- Frontend should match these validations

### B. Frontend Implementation Tasks

#### Index Type Detection
- [x] Update `getInitialIndexType()` in `src/pages/Indexes/NewIndex.js` to check `index?.is_text` first, then fallback to `default_language`/`weights` check
- [x] Update index table display to use `is_text` field if available (optional: add visual indicator)

#### Default Language Handling
- [x] Update `createIndex` thunk (`src/slices/index/thunk.js`) to send `default_language: "none"` when creating text index without explicit default language
- [x] Update `updateIndex` thunk similarly
- [x] Update form initial values to handle "none" as default language value

#### Validation Enhancements
- [x] Add validation in `NewIndex.js` to ensure all text fields in keys are present in weights map when weights provided
- [x] Update `defaultLanguage` validation to accept MongoDB language codes (ISO 639-1 two-letter codes + "none")
- [x] Add helper function or validation schema for MongoDB language code validation

#### Response Handling
- [x] Ensure index list/get responses handle `is_text` field (should be backward compatible)
- [x] Update any index comparison displays to use `is_text` field if available

### C. Testing

- [ ] Test text index creation without default language (should send "none")
- [ ] Test text index update without default language
- [ ] Test validation: weights must include all text fields
- [ ] Test validation: default_language must be valid MongoDB language code
- [ ] Test backward compatibility: existing indexes without `is_text` field should still work
- [ ] Test index type detection using `is_text` field from backend

### Notes

- All changes are backward compatible (existing indexes without `is_text` default to false)
- Backend automatically sets `is_text` when syncing from MongoDB
- Signature comparison fix is backend-only (no FE changes needed)
- Default language "none" handling ensures consistent signatures after sync

---

## v0.3.2 - Bug Fixes

### A. Bug Fixes

#### Bug1: Cannot delete index -> URL not found
- [x] Fix `handleDeleteClick` in `src/pages/Indexes/IndexesList.js` to pass `{data: {id: index.id}}` instead of `{data: index}`
- [x] Ensure delete thunk receives correct data structure

#### Bug2: Typing weights as JSON is too complicated
- [x] Add weight input field next to each key field when index type is 'text'
- [x] Store weights as object in component state (`keyWeights`), keyed by field name
- [x] Remove JSON textarea for weights
- [x] Update form submission to include weights object from state
- [x] Update validation to check weights object instead of JSON string
- [x] Update `createIndex` and `updateIndex` thunks to handle weights as object directly (no JSON parsing)

#### Bug3: Not allow Unique, Expire when choose Text index
- [x] Disable "Is Unique" radio buttons when `indexType === 'text'`
- [x] Disable "Expire After Seconds" input when `indexType === 'text'`
- [x] Add visual indication (grayed out) and helper text explaining why disabled
- [x] Reset `unique` to `false` and `expireAfterSeconds` to `null` when switching to text index type

#### Bug4: Haven't hide index `_id_` in both Backend and Frontend
- [x] Filter out indexes where `name === '_id_'` from display in `src/pages/Indexes/IndexesList.js`
- [x] Filter `_id_` index in `onToggleAll` function
- [x] Filter `_id_` index in comparison displays (`CompareIndexesByDatabase.js`, `CompareIndexesByCollection.js`)

#### Bug5: Index text -> no ascending/descending input (because all text)
- [x] Hide ascending/descending select dropdown when `indexType === 'text'` in `src/pages/Indexes/NewIndex.js`
- [x] Automatically set key values to "text" for text indexes when adding new keys or switching index type
- [x] Update validation schema to allow "text" as a value when `indexType === 'text'`
- [x] Update initial values loading to handle text index keys properly (value "text" instead of 1/-1)
- [x] Update `createIndex` and `updateIndex` thunks to transform keys array: set all key values to "text" for text indexes before sending to backend

#### Bug6: Not render sync history properly (page /compare)
- [x] Update `SyncHistory.js` to handle different response structures: array, object with `data` property (paginated), or object with `records` property
- [x] Fix rendering condition to check if `syncs` is an array instead of checking `syncs.records`
- [x] Fix sync history not loading on `/compare` page - component depends on Redux `currentDatabase` but compare page uses local state `selectedDatabase`
- [x] Update `SyncHistory.js` to accept `selectedDatabase` as prop and use it if provided, otherwise fall back to Redux `currentDatabase`
- [x] Update `CompareIndexesDashboard.js` to pass `selectedDatabase` prop to `SyncHistory` component

#### Bug7: Button "Reload" on page `/compare` not working
- [x] Update `onClickReload()` in `CompareIndexesDashboard.js` to re-dispatch compare actions
- [x] Dispatch `compareByCollection` if collection is selected, otherwise dispatch `compareByDatabase`

### B. Implementation Details

**Files Modified:**
- `src/pages/Indexes/IndexesList.js` - Fixed delete call, added `_id_` filtering
- `src/pages/Indexes/NewIndex.js` - Added weight inputs, disabled fields for text indexes, hide asc/desc dropdown for text indexes, auto-set key values to "text"
- `src/slices/index/thunk.js` - Updated weights handling to use object instead of JSON string, transform keys for text indexes
- `src/pages/Indexes/CompareIndexes/Components/CompareIndexesByDatabase.js` - Added `_id_` filtering
- `src/pages/Indexes/CompareIndexes/Components/CompareIndexesByCollection.js` - Added `_id_` filtering
- `src/pages/Indexes/CompareIndexes/Components/SyncHistory.js` - Fixed sync history rendering to handle different response structures
- `src/pages/Indexes/CompareIndexes/CompareIndexesDashboard.js` - Fixed reload button to re-dispatch compare actions

### C. Testing

- [x] Test index deletion works correctly
- [x] Test weight inputs appear/disappear based on index type
- [x] Test weights are correctly saved and loaded
- [x] Test Unique and Expire fields are disabled for text indexes
- [x] Test `_id_` index is not displayed in index list
- [x] Test `_id_` index is not shown in comparisons
- [ ] Test text index creation - keys should have value "text", no asc/desc dropdown visible
- [ ] Test editing existing text index - keys should load with value "text"
- [ ] Test switching from regular to text index type - all keys should update to "text"
- [ ] Test switching from text to regular index type - keys should allow 1/-1 selection
- [ ] Test backend receives correct key values for text indexes
- [ ] Test sync history renders correctly with array response
- [ ] Test sync history renders correctly with paginated response (data property)
- [ ] Test sync history renders correctly with records property
- [ ] Test reload button refreshes compare data when collection is selected
- [ ] Test reload button refreshes compare data when only database is selected

### Notes

- Weights are now managed per-field in the UI, making it much easier for users
- Text indexes cannot have unique or TTL options (MongoDB constraint)
- `_id_` index is MongoDB's default index and should not be managed through the UI
- Text indexes require key values to be "text" (string), not 1 or -1 (MongoDB constraint)
- Sync history component now handles paginated responses with `data` array or `records` array
- Reload button now properly refreshes compare data by re-dispatching compare actions

---

## v0.4.0 - Missing from Backend

### Sync Options
- [ ] Sync options support (`option_missing`, `option_extra`) in sync endpoints
- FE sends: `option_missing` (1=forward, 2=backward), `option_extra` (1=forward, 2=backward)
- BE: Not in OpenAPI spec for sync endpoints

### Database
- [ ] `is_sync_index` flag support in DatabaseCreateRequest
- FE sends `is_sync` flag but BE may not handle it

### Response Format
- [ ] Consistent error response format
- FE expects `error.response.data.message`, verify BE returns this

### Sync Status
- [ ] Sync status response format alignment
- FE expects: `{records: [...], completed_tasks, total_tasks, database_name, collection_name}`
- BE spec shows: `{id, status, progress, error, collections, is_finished, started_at, completed_at}`
- Need alignment

---

## v0.5.0 - Deferred Frontend & Backend Implementation

### Deferred from v0.2.0 B (Frontend)

- [ ] Get single database details view
- [ ] Database connection validation UI feedback
- [ ] View single index details
- [ ] Individual sync status view by `sync_id`
- [ ] Error boundary for API errors
- [ ] Search/filter functionality

### Backend Implementation

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

- [ ] Add `is_sync_index` flag to `DatabaseCreateRequest`
  - Type: boolean
  - Default: false
  - If true, automatically sync indexes after database creation
  - Update OpenAPI spec

- [ ] Align sync status response with FE expectations
  - Current BE spec: `{id, status, progress, error, collections, is_finished, started_at, completed_at}`
  - FE expects: `{records: [...], completed_tasks, total_tasks, database_name, collection_name}`
  - Decision: Update BE to match FE OR update FE to match BE spec
  - Update OpenAPI spec accordingly

- [ ] Ensure all error responses follow OpenAPI spec:
  ```json
  {
    "status_code": 400,
    "error_code": 0,
    "error": "Error message or validation errors"
  }
  ```

- [ ] Verify `error.response.data.message` compatibility (may need adapter)

- [ ] Ensure all responses include `status_code` and `error_code`
- [ ] Verify pagination uses `extra` object (not `paging`)
- [ ] Remove inconsistent `.result` wrapper in compare responses

---

## Notes

- Base path: All endpoints should use `/api/doctor-manager-api/v1` prefix
- Sync options constants: `OptionSyncForward=1`, `OptionSyncBackward=2`, `OptionKeeping=0`
- FE currently uses different URL patterns than OpenAPI spec
- Sync operations are async - need polling mechanism for status updates
