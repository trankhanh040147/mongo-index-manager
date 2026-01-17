# Current Status and Tasks

## Current Implementation Status

### ✅ Implemented Features

#### Authentication System
- User registration with email/username
- Login with access/refresh token generation
- Token refresh mechanism
- User profile management (get/update)
- JWT authentication middleware
- Token revocation support
- Password hashing (SHA256)

#### Database Management
- Create database connection configuration
- Get database details
- List databases with pagination and search
- Update database configuration
- Delete database (with cascade delete of indexes)
- List collections for a database
- Connection testing on create/update
- Auto-sync indexes on database creation (optional)

#### Index Management (DR)
- Create index with validation
  - Key field validation
  - Unique index constraint checking
  - TTL index validation (single-key only)
  - Duplicate index prevention
- Get index by ID
- List indexes by collection (paginated, searchable)
- Update index definition
- Delete index
- Auto-generate index name from key signature

#### Index Comparison
- Compare indexes by collections
  - Returns missing, matched, and redundant indexes
- Compare indexes by database
  - Compares all collections with indexes in DR
- Real-time connection to target databases
- Key signature matching for accurate comparison

#### Index Synchronization
- Sync indexes by collections (DR → Real DB)
- Sync indexes by database (all collections)
- Reverse sync from Real DB to DR
- Async job processing via Redis queue
- Sync conflict prevention (one sync per database)
- Creates missing indexes in target DB
- Removes redundant indexes from target DB
- Sync status tracking with progress and error reporting
- Sync status API endpoints

#### Infrastructure
- RESTful API with Fiber framework
- MongoDB integration for manager storage
- Redis integration for job queue (Asynq)
- Request validation
- Error handling and response formatting
- Pagination support
- Logging with Zerolog
- Elastic APM support (optional)

### ❌ Missing Features

#### Script Generation
- **Status**: Not implemented
- **Description**: Generate mongosh scripts from index definitions
- **Use Case**: Allow manual deployment of indexes via scripts
- **Requirements**:
  - Export create index commands
  - Export drop index commands
  - Support for all index options (unique, TTL, etc.)
  - Format as executable mongosh script

#### Reverse Sync
- **Status**: ✅ Implemented
- **Description**: Sync indexes from Real DB back to DR
- **Endpoint**: `POST /indexes/sync-from-database`
- **Features**:
  - Connects to Real DB and fetches all indexes
  - Converts indexes to DR format
  - Handles conflicts (skips duplicates by default)
  - Returns summary (imported count, skipped count)

#### Sync Status API
- **Status**: ✅ Implemented
- **Description**: Track and query sync operation status
- **Endpoints**:
  - `GET /indexes/sync-status/:sync_id` - Get sync status by ID
  - `GET /indexes/sync-status/by-database/:database_id` - List sync history for database
- **Features**:
  - Status tracking (pending, running, completed, failed)
  - Progress tracking (0-100%)
  - Error reporting
  - Timestamps (started_at, completed_at)

#### Sync by Database
- **Status**: ✅ Implemented
- **Description**: Sync all indexes for a database (all collections)
- **Endpoint**: `POST /indexes/sync-by-database`
- **Features**:
  - Auto-detects all collections with indexes
  - Syncs all collections in one operation
  - Uses existing sync job handler

### ⚠️ Known Issues

#### Runtime Issues
- **Project cannot run**: Missing dependencies or configuration
  - Requires MongoDB instance for manager DB
  - Requires Redis instance for job queue
  - Requires JWT key pair (public.pem, private.pem)
  - May need environment variables configured

#### Code Issues
- ✅ **Fixed**: Database deletion now checks for active sync operations before deletion

#### Missing Validations
- No validation for database URI format beyond basic checks
- No connection pool management for target databases
- No timeout handling for long-running sync operations

## Next Steps (Prioritized)

### Priority 1: Make Project Runnable

1. **Setup Development Environment**
   - [ ] Create `.env.example` file with all required variables
   - [ ] Document MongoDB setup requirements
   - [ ] Document Redis setup requirements
   - [ ] Create script to generate JWT key pair
   - [ ] Add docker-compose.yml for local development
   - [ ] Test application startup

2. **Fix Database Deletion TODO**
   - [x] Implement sync status check before database deletion
   - [x] Return appropriate error if sync is in progress
   - [ ] Add test cases for this scenario

### Priority 2: Complete Core Features

3. **Implement Script Generation**
   - [ ] Create endpoint: `POST /indexes/generate-script`
   - [ ] Implement script generator utility
   - [ ] Support create index commands
   - [ ] Support drop index commands
   - [ ] Format as mongosh-compatible script
   - [ ] Add options for script format (create only, drop only, both)
   - [ ] Test script generation with various index types
   - **Note**: Left for later implementation as requested

4. **Implement Sync Status API**
   - [x] Create endpoint: `GET /indexes/sync-status/:sync_id`
   - [x] Create endpoint: `GET /indexes/sync-status/by-database/:database_id`
   - [x] Return sync progress, status, errors
   - [x] Add error details to sync record
   - [x] Update sync handler to record errors properly
   - [x] Extend Sync model with Status, Progress, StartedAt, CompletedAt fields

5. **Implement Reverse Sync**
   - [x] Create endpoint: `POST /indexes/sync-from-database`
   - [x] Fetch indexes from Real DB
   - [x] Convert to DR index format
   - [x] Handle conflicts (duplicate names/signatures)
   - [x] Create indexes in DR
   - [x] Add validation and error handling

### Priority 3: Enhancements

6. **Sync by Database**
   - [x] Extend sync endpoint to support database-wide sync
   - [x] Auto-detect all collections with indexes
   - [x] Sync all collections in one operation

7. **Improve Error Handling**
   - [ ] Add connection pool management
   - [ ] Implement timeout handling for sync operations
   - [ ] Add retry logic for transient failures
   - [ ] Improve error messages and codes

8. **Add Monitoring**
   - [ ] Add metrics for sync operations
   - [ ] Track sync duration
   - [ ] Monitor job queue health
   - [ ] Add health check endpoint

### Priority 4: Documentation and Testing

9. **Documentation**
   - [ ] Update API documentation with new endpoints
   - [ ] Add deployment guide
   - [ ] Create troubleshooting guide
   - [ ] Document script generation usage

10. **Testing**
    - [ ] Add unit tests for index operations
    - [ ] Add integration tests for sync operations
    - [ ] Test script generation
    - [ ] Test error scenarios

## Technical Debt

### Code Quality
- [x] Add missing error handling in sync job handler
- [ ] Refactor duplicate code in compare functions
- [ ] Improve logging consistency
- [ ] Add request/response examples in code comments

### Performance
- [ ] Optimize index queries (add indexes to manager DB)
- [ ] Implement connection pooling for target databases
- [ ] Add caching for frequently accessed data
- [ ] Optimize sync job processing

### Security
- [ ] Add rate limiting
- [ ] Implement request size limits
- [ ] Add input sanitization
- [ ] Review JWT token handling

### Database Schema
- [ ] Add indexes to manager DB collections
- [ ] Review and optimize data models
- [ ] Add database migrations if needed

## Implementation Notes

### Script Generation Implementation
```go
// Proposed structure
type ScriptGenerator interface {
    GenerateCreateScript(indexes []Index) string
    GenerateDropScript(indexes []Index) string
    GenerateFullScript(creates []Index, drops []Index) string
}
```

### Reverse Sync Implementation
```go
// ✅ Implemented - Flow
1. Connect to Real DB
2. Fetch all indexes using GetIndexesByDbName
3. For each index:
   - Check if exists in DR (by key signature)
   - If not exists, create in DR
   - If exists, handle conflict (skip by default)
4. Return summary of imported indexes
```

### Sync Status Implementation
```go
// ✅ Implemented - Extended Sync model
type Sync struct {
    // ... existing fields
    Status      string    // "pending", "running", "completed", "failed"
    Progress    int       // 0-100
    StartedAt   time.Time
    CompletedAt *time.Time
    Error       string
}
```

## Dependencies

### Required Services
- MongoDB (for manager database)
- Redis (for job queue)
- JWT key pair (RSA keys)

### Go Dependencies
- All dependencies listed in `go.mod`
- Go version: 1.25

## Environment Setup Checklist

- [ ] MongoDB running and accessible
- [ ] Redis running and accessible
- [ ] JWT keys generated and placed in `certs/` directory
- [ ] Environment variables configured (`.env` file)
- [ ] Database `db_manager` created in MongoDB
- [ ] Go modules downloaded (`go mod download`)

## Testing Checklist

- [ ] Application starts without errors
- [ ] Can register and login
- [ ] Can create database connection
- [ ] Can create indexes
- [ ] Can compare indexes
- [ ] Can sync indexes (requires Redis)
- [ ] Job queue processes sync tasks
- [ ] Error handling works correctly
