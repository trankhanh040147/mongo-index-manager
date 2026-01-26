# Roadmap

## Version 0.3.0

### Release Date

TBD

### Overview

Version 0.3.0 introduces enhanced index options support including collation, default language, and weights for text
indexes. It also adds collection management capabilities and improves key signature generation.

### Features

#### Enhanced Index Options Support

- **Collation Support**: Full collation options for indexes
    - `locale`: Collation locale (e.g., "en", "fr")
    - `strength`: Collation strength (1-5)
    - `case_level`: Case-level comparison option
    - `case_first`: Case first ordering ("upper" or "lower")
    - `numeric_ordering`: Numeric ordering option
- **Default Language**: Support for default language in text indexes
- **Weights**: Field weights support for text indexes

All index-related endpoints now support these enhanced options:

- Create index (`POST /indexes/`)
- Get index (`GET /indexes/{id}`)
- List indexes by collection (`POST /indexes/list-by-collection`)
- Update index (`PUT /indexes/{id}`)
- Compare indexes (`POST /indexes/compare-by-collections`, `POST /indexes/compare-by-database`)

#### Collection Management

- **Create Collection Endpoint**: New endpoint to create MongoDB collections
    - `POST /databases/collections/`
    - Creates a new collection in the specified database
    - Validates database connection before creation

#### Improvements

- **Key Signature Generation**: Improved key signature generation algorithm
    - Keys are now sorted by field name for consistent signature generation
    - Ensures identical indexes produce the same signature regardless of key order

### API Changes

#### New Endpoints

- `POST /databases/collections/` - Create a MongoDB collection
    - Request: `DatabaseCreateCollectionRequest` (database_id, collection)
    - Response: `DatabaseCreateCollectionResponse` (success boolean)
    - Status codes: 201, 400, 401, 404, 412, 500

#### Enhanced Schemas

- `IndexOption` schema now includes:
    - `collation` (optional): Collation object with locale, strength, case_level, case_first, numeric_ordering
    - `default_language` (optional): Default language for text indexes
    - `weights` (optional): Field weights map for text indexes

- New `Collation` schema component:
    - `locale` (required): Collation locale string
    - `strength` (optional): Integer (1-5)
    - `case_level` (optional): Boolean
    - `case_first` (optional): String ("upper" or "lower")
    - `numeric_ordering` (optional): Boolean

All index request and response schemas automatically include these new fields through the `IndexOption` reference.

### Breaking Changes

None. All changes are backward compatible. Existing API calls will continue to work, and new fields are optional.

### Migration Notes

No migration required. The new fields are optional and can be added incrementally to existing indexes when updating
them.

### Technical Details

#### Collation Support

Collation options allow fine-grained control over string comparison in MongoDB indexes. This is particularly useful for:

- Case-insensitive searches
- Locale-specific sorting
- Custom comparison rules

#### Text Index Enhancements

Text indexes now support:

- Default language specification
- Field weights for relevance scoring
- Proper handling of collation conflicts (text indexes cannot have collation)

#### Key Signature Improvements

The key signature generation now:

1. Sorts keys by field name alphabetically
2. Generates consistent signatures for equivalent indexes
3. Maintains backward compatibility with existing signatures

### Testing Recommendations

- Test index creation with all new collation options
- Verify text index creation with default_language and weights
- Test collection creation endpoint with various collection names
- Verify key signature consistency for indexes with different key orders
- Test backward compatibility with existing API calls

### Future Considerations

- Script generation for index deployment
- Additional index types support
- Enhanced validation for collation options
- Performance optimizations for large-scale index operations

---

## Version 0.3.1

### Release Date

TBD

### Overview

Version 0.3.1 fixes text index signature comparison issues by properly handling MongoDB's auto-generated keys (`_fts`
and `_ftsx`) that are automatically added to text indexes. It also adds default language handling and validation
improvements for text indexes.

### Features

#### Text Index Comparison Fix

- **Problem**: When creating a text index and comparing it, signatures don't match because MongoDB automatically creates
  `_fts` and `_ftsx` keys for text indexes, but DRManager doesn't include these keys when generating signatures.
- **Solution**:
    - Added `is_text` field to identify text indexes
    - Modified signature generation to skip `_fts` and `_ftsx` keys for text indexes during comparison
    - Automatic detection of text indexes when fetching from MongoDB or creating in DRManager

#### Default Language Handling

- **Problem**: When creating a text index without setting default language, MongoDB may not have a default_language
  field, causing signature mismatch after sync.
- **Solution**:
    - Set default language to "none" when creating/updating text indexes without explicit default language
    - Apply same logic when syncing indexes from MongoDB

#### Text Index Validation Enhancements

- **Weights Validation**: Text indexes now validate that all text fields are present in weights map when weights are
  provided
- **Language Validation**: Added custom validation for MongoDB language codes (ISO 639-1 codes + "none")

### Implementation Tasks

#### Text Index Detection and Signature Fix

- [x] Add `IsText bool` field to both `models.Index` and `mongodb.Index` structs with BSON tag `is_text`
- [x] Modify `GetKeySignature()` in `database/mongo/models/index.go` to skip `_fts` and `_ftsx` keys when `IsText` is
  true
- [x] Modify `GetKeySignature()` in `utilities/mongodb/base.go` to skip `_fts` and `_ftsx` keys when `IsText` is true
- [x] Detect and set `IsText` when fetching indexes from MongoDB in `GetIndexesByDbNameAndCollections()` and
  `GetIndexesByDbName()`
- [x] Set `IsText` when creating indexes in `api/controllers/index/controller.go` Create() method
- [x] Set `IsText` when updating indexes in `api/controllers/index/controller.go` Update() method
- [x] Set `IsText` when syncing indexes in `SyncFromDatabase()` and `database/controller.go` Create() method

#### Default Language Handling

- [x] Set DefaultLanguage to "none" when creating text index without explicit default language in Create() method
- [x] Set DefaultLanguage to "none" when updating text index without explicit default language in Update() method
- [x] Set DefaultLanguage to "none" when syncing text indexes from MongoDB if empty in SyncFromDatabase() and database
  controller

#### Validation Enhancements

- [x] Add validation in IndexCreateBodyValidate to ensure all text fields are in weights map when weights provided
- [x] Add validation in IndexUpdateBodyValidate to ensure all text fields are in weights map when weights provided
- [x] Add mongodbLanguage custom validation function in custom.go to validate MongoDB language codes
- [x] Add validate:"mongodbLanguage" tag to DefaultLanguage fields in serializers
- [x] Update openapi.yaml with default language validation and weights validation documentation

### Technical Details

#### Text Index Detection

- Text indexes are detected by checking if any key has value `"text"` OR if MongoDB's auto-generated keys `_fts` or
  `_ftsx` exist
- Helper functions:
    - `isTextIndex()` in `utilities/mongodb/service.go` - checks for `_fts`/`_ftsx` keys or `"text"` value
    - `IsTextIndex()` in `database/mongo/models/index.go` - checks for `"text"` value

#### Signature Generation

- When `IsText` is true, the signature generation automatically filters out `_fts` and `_ftsx` keys
- This ensures consistent signatures between DRManager and MongoDB for text indexes
- Non-text indexes are unaffected and continue to work as before

### API Changes

- **Validation**: `default_language` field now validates against MongoDB language codes (ISO 639-1 + "none")
- **Weights Validation**: When weights are provided for text indexes, all text fields must be present in the weights map
- **Default Behavior**: Text indexes without explicit default language now default to "none" instead of empty string

### OpenAPI Specification Updates

- **`default_language` field documentation** (IndexOption schema):
    - Added detailed description explaining validation requirements
    - Documents that it must be a valid MongoDB language code (ISO 639-1 two-letter code) or "none"
    - Notes that if not specified for a text index, it defaults to "none"
    - Includes examples: "en", "fr", "de", "none"
- **`weights` field documentation** (IndexOption schema):
    - Added description explaining validation requirement
    - Documents that when weights are provided, all text fields in the index keys must be present in the weights map
    - Clarifies that each key should be a field name and the value should be the weight (number)

### Breaking Changes

None. All changes are backward compatible. Existing indexes will default `is_text` to `false`, which is safe for
non-text indexes.

### Migration Notes

- [x] Existing indexes without `is_text` field will default to `false` (safe for non-text indexes)
- [x] Text indexes will be automatically detected and marked when:
    - Syncing from MongoDB
    - Creating new text indexes
    - Updating existing text indexes
- [x] No manual migration required

### Testing Recommendations

- [x] Test text index creation and comparison
- [x] Verify signature matching for text indexes with `_fts` and `_ftsx` keys
- [x] Test backward compatibility with existing non-text indexes
- [x] Verify text index detection when syncing from MongoDB
- [x] Test text index comparison in both `compare-by-collections` and `compare-by-database` endpoints

---

## v0.3.2

- [x] API Update/Delete Collection
- [x] API List Sync: add database info (field `database`) and collections

## Version 0.4.0

### Release Date

TBD

### Overview

Version 0.4.0 focuses on improving sync functionality with configurable options, enhancing database creation
capabilities, and standardizing response formats for better frontend-backend alignment.

### Features

#### Sync Options Support

- **Configurable Sync Direction**: Add sync options to control behavior for missing and extra indexes
    - `option_missing`: Control behavior for indexes in manager but not in database
        - `1` = Forward sync (create missing indexes in database)
        - `2` = Backward sync (remove missing indexes from manager)
    - `option_extra`: Control behavior for indexes in database but not in manager
        - `1` = Forward sync (remove extra indexes from database)
        - `2` = Backward sync (import extra indexes to manager)
- **Affected Endpoints**:
    - `POST /indexes/sync-by-collections`
    - `POST /indexes/sync-by-database`
- **Status**: Not currently in OpenAPI spec - needs to be added

#### Database Creation Enhancement

- **Auto-sync Index Flag**: Verify and ensure proper handling of `is_sync_index` flag
    - Frontend sends `is_sync` flag in database creation
    - Backend should handle `is_sync_index` flag in `DatabaseCreateRequest`
    - When enabled, automatically syncs indexes from database to manager on creation
- **Status**: May need verification and implementation

#### Response Format Standardization

- **Consistent Error Response Format**: Align error response structure with frontend expectations
    - Frontend expects: `error.response.data.message`
    - Verify backend returns error messages in this format
    - Ensure all error responses follow consistent structure
- **Impact**: Improves error handling and user experience

#### Sync Status Response Alignment

- **Frontend-Backend Format Alignment**: Align sync status response with frontend expectations
    - **Frontend expects**:
      ```json
      {
        "records": [...],
        "completed_tasks": number,
        "total_tasks": number,
        "database_name": string,
        "collection_name": string
      }
      ```
    - **Backend currently returns**:
      ```json
      {
        "id": ObjectID,
        "status": string,
        "progress": number,
        "error": string,
        "collections": string[],
        "is_finished": boolean,
        "started_at": DateTime,
        "completed_at": DateTime
      }
      ```
    - **Action Required**: Align response format or create adapter/mapper
- **Affected Endpoints**:
    - `GET /indexes/sync-status/{sync_id}`
    - `GET /indexes/sync-status/by-database/{database_id}`

### API Changes

#### Enhanced Sync Endpoints

- `POST /indexes/sync-by-collections` - Add sync options
    - Request: Add `option_missing` and `option_extra` fields
    - Values: `1` (forward) or `2` (backward)
- `POST /indexes/sync-by-database` - Add sync options
    - Request: Add `option_missing` and `option_extra` fields
    - Values: `1` (forward) or `2` (backward)

#### Database Creation

- `POST /databases/` - Verify `is_sync_index` flag handling
    - Ensure `is_sync_index` flag is properly processed
    - When `true`, automatically imports indexes from database

#### Response Format Updates

- Standardize error response format across all endpoints
- Update sync status response format to match frontend expectations
- Add response mappers/adapters if needed

### Implementation Tasks

#### Sync Options

- [ ] Add `option_missing` and `option_extra` fields to sync request schemas
- [ ] Update sync job handler to respect sync options
- [ ] Implement forward/backward sync logic based on options
- [ ] Update OpenAPI spec with new fields
- [ ] Add validation for option values (1 or 2)

#### Database Creation

- [ ] Verify `is_sync_index` flag handling in `DatabaseCreateRequest`
- [ ] Ensure proper index import when flag is enabled
- [ ] Update OpenAPI spec if needed
- [ ] Add tests for auto-sync functionality

#### Error Response Format

- [ ] Audit all error responses
- [ ] Standardize error response structure
- [ ] Ensure `error.response.data.message` format
- [ ] Update error handling middleware if needed

#### Sync Status Format

- [ ] Review frontend requirements
- [ ] Decide on approach: modify backend response or add adapter
- [ ] Implement response transformation
- [ ] Update OpenAPI spec
- [ ] Add fields: `records`, `completed_tasks`, `total_tasks`, `database_name`, `collection_name`

### Breaking Changes

Potential breaking changes if sync status response format is modified. Consider versioning or adapter approach.

### Migration Notes

- Sync endpoints will accept new optional fields (backward compatible)
- Sync status response changes may require frontend updates
- Error response format changes should be backward compatible if done carefully

### Testing Recommendations

- Test all sync option combinations (missing/extra × forward/backward)
- Verify database creation with `is_sync_index` flag
- Test error response format consistency
- Verify sync status response format alignment
- Test backward compatibility for existing API calls

### Technical Considerations

- Sync options should default to forward sync (1) for backward compatibility
- Consider adding sync option validation
- Sync status format alignment may require database/collection name lookups
- Error response standardization should maintain existing error codes

---

## Version 0.6.0

- Features: Can force stop/delete/retry sync

