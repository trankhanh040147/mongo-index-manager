# Pre-Development Considerations - MongoDB Index Manager Frontend

## Critical Items to Address Before Starting

### 1. Backend API Configuration

#### ✅ **API Base URL**
- **Question**: What is the backend API base URL for development and production?
- **Action Required**: 
  - Confirm the backend is running and accessible
  - Set up environment variables:
    ```bash
    VITE_API_BASE_URL=http://localhost:8080/api/doctor-manager-api/v1  # Dev
    VITE_API_BASE_URL=https://api.yourdomain.com/api/doctor-manager-api/v1  # Prod
    ```

#### ⚠️ **CORS Configuration**
- **Critical**: Backend must allow CORS from frontend origin
- **Action Required**: 
  - Verify backend CORS settings allow your frontend domain
  - For development: Allow `http://localhost:5173` (Vite default)
  - For production: Configure allowed origins
  - Ensure credentials are allowed if using cookies

#### 🔍 **API Response Format Verification**
- **Action Required**: 
  - Test a few API endpoints to confirm response format matches documentation
  - Verify error response structure
  - Check if pagination `extra` field structure matches docs

---

### 2. Missing API Endpoints

#### ⚠️ **Sync Status Tracking**
- **Issue**: API documentation notes "sync status tracking not documented in current API"
- **Impact**: Cannot show real-time sync progress
- **Options**:
  1. **Polling**: Poll comparison endpoint to check if sync completed
  2. **WebSocket**: If backend supports, use WebSocket for real-time updates
  3. **Status Endpoint**: Request backend team to add sync status endpoint
  4. **Optimistic UI**: Show "Syncing..." state and refresh after estimated time

**Recommendation**: Start with polling approach, request status endpoint for Phase 6

---

### 3. Authentication Strategy

#### 🔐 **Token Storage**
- **Decision Needed**: Where to store tokens?
  - **localStorage**: Persists across tabs, survives refresh (recommended)
  - **sessionStorage**: Cleared on tab close
  - **Memory only**: Lost on refresh (not recommended)

**Recommendation**: Use `localStorage` with Zustand persist middleware

#### 🔄 **Token Refresh Strategy**
- **Access Token**: 10 minutes expiry
- **Refresh Token**: 24 hours expiry
- **Action Required**: 
  - Implement automatic refresh before expiration (e.g., refresh at 8 minutes)
  - Handle refresh failure (redirect to login)
  - Prevent multiple simultaneous refresh requests

#### 🚫 **Token Revocation**
- **Question**: How to handle revoked tokens?
- **Action Required**: 
  - Backend returns 401 on revoked token
  - Frontend should clear tokens and redirect to login

---

### 4. Error Handling Strategy

#### 📋 **Error Response Format**
API returns:
```json
{
  "status_code": 400,
  "error_code": 0,
  "error": "Error message or validation errors"
}
```

**Considerations**:
- `error` field can be string or object (validation errors)
- Need to handle both cases
- Display user-friendly error messages
- Show validation errors inline in forms

#### 🔍 **HTTP Status Codes to Handle**
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Token expired/invalid
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `412 Precondition Failed`: Connection/test failures
- `500 Internal Server Error`: Server errors

**Action Required**: Create error handler utility for each status code

---

### 5. Pagination Handling

#### 📄 **Pagination Format**
```json
{
  "data": [...],
  "extra": {
    "limit": 10,
    "page": 1,
    "total": 100
  }
}
```

**Considerations**:
- API uses `page` (1-indexed) not `offset`
- Default limit: 50, Maximum: 50
- Some endpoints may not return `total` (e.g., comparison endpoints)
- Need to handle missing `total` gracefully

**Action Required**: 
- Create pagination hook/utility
- Handle edge cases (no total, empty results)

---

### 6. Project Structure Decisions

#### 📁 **Frontend Location**
- **Option 1**: Separate repository (`mongo-index-manager-frontend`)
- **Option 2**: Monorepo (`frontend/` folder in current repo)
- **Option 3**: Subdirectory in current repo

**Recommendation**: Start with Option 2 (monorepo) for easier development

#### 🎨 **Ant Design Theme Customization**
- **Decision Needed**: Customize theme colors or use defaults?
- **Action Required**: 
  - Define primary color (default: #1890ff)
  - Define success/warning/error colors
  - Configure theme in `src/styles/theme.ts`

#### 🌐 **Internationalization (i18n)**
- **Question**: Need multi-language support?
- **Action Required**: 
  - If yes: Set up `react-i18next` or Ant Design's built-in i18n
  - If no: Use English only (can add later)

---

### 7. Development Environment Setup

#### 🛠️ **Node.js Version**
- **Required**: Node.js 18+ (for Vite 5)
- **Action Required**: 
  - Verify Node.js version: `node --version`
  - Use `.nvmrc` file to lock version

#### 📦 **Package Manager**
- **Options**: npm, yarn, pnpm
- **Recommendation**: Use `pnpm` for faster installs (or npm if preferred)

#### 🔧 **Development Tools**
- **Action Required**: 
  - Set up ESLint config
  - Set up Prettier config
  - Configure VS Code settings (optional)
  - Set up Husky for pre-commit hooks (optional)

---

### 8. Data Validation

#### ✅ **Form Validation**
- **Using**: React Hook Form + Zod
- **Action Required**: 
  - Create Zod schemas for all forms:
    - Register form
    - Login form
    - Database form
    - Index form
  - Validate MongoDB URI format
  - Validate ObjectID format
  - Validate email format

#### 🔍 **MongoDB URI Validation**
- **Format Examples**:
  - `mongodb://localhost:27017`
  - `mongodb://user:password@host:port/database`
  - `mongodb+srv://user:password@cluster.mongodb.net/database`
- **Action Required**: Create URI validator utility

---

### 9. UI/UX Decisions

#### 🎨 **Design System**
- **Ant Design**: Use default components
- **Customization Level**: 
  - Minimal: Use Ant Design defaults
  - Moderate: Customize colors and spacing
  - Full: Custom theme with design tokens

**Recommendation**: Start with minimal, customize as needed

#### 📱 **Responsive Breakpoints**
- **Ant Design Breakpoints**:
  - `xs`: < 576px
  - `sm`: ≥ 576px
  - `md`: ≥ 768px
  - `lg`: ≥ 992px
  - `xl`: ≥ 1200px
  - `xxl`: ≥ 1600px

**Target**: Desktop (lg+) and Tablet (md-lg)

#### 🎯 **Loading States**
- **Action Required**: 
  - Use Ant Design `Spin` component
  - Create skeleton loaders for lists
  - Show loading states for async operations

#### 🔔 **Notifications**
- **Using**: Ant Design `message` API
- **Action Required**: 
  - Success messages for create/update/delete
  - Error messages for failures
  - Info messages for sync operations

---

### 10. State Management Strategy

#### 🗄️ **Zustand Stores**
- **Auth Store**: Tokens, user profile
- **Database Store** (Optional): Cache database list
- **Index Store** (Optional): Cache indexes by collection

**Decision Needed**: 
- Cache data in Zustand or refetch on each navigation?
- **Recommendation**: Cache for better UX, invalidate on mutations

#### 🔄 **Data Fetching**
- **Options**:
  1. **Axios directly**: Simple, manual cache management
  2. **React Query**: Automatic caching, refetching, background updates
  3. **SWR**: Similar to React Query

**Recommendation**: Start with Axios directly, consider React Query in Phase 6 if needed

---

### 11. Testing Strategy

#### ✅ **Test Coverage Goals**
- **Unit Tests**: Utilities, hooks, stores
- **Component Tests**: Forms, lists, modals
- **Integration Tests**: Auth flow, CRUD flows
- **E2E Tests**: Critical user paths

**Target**: 70%+ coverage

#### 🧪 **Test Data**
- **Action Required**: 
  - Create mock API responses
  - Set up MSW (Mock Service Worker) for API mocking
  - Create test fixtures

---

### 12. Security Considerations

#### 🔒 **Token Security**
- **Action Required**: 
  - Never log tokens to console in production
  - Use HTTPS in production
  - Implement token refresh properly
  - Clear tokens on logout

#### 🛡️ **XSS Prevention**
- **React**: Automatically escapes content
- **Action Required**: 
  - Avoid `dangerouslySetInnerHTML` unless necessary
  - Sanitize user input if displaying HTML

#### 🔐 **Input Validation**
- **Action Required**: 
  - Validate all inputs on frontend
  - Don't trust frontend validation alone (backend validates too)
  - Sanitize MongoDB URIs before display

---

### 13. Performance Considerations

#### ⚡ **Code Splitting**
- **Action Required**: 
  - Lazy load routes
  - Split vendor chunks (React, Ant Design)
  - Load heavy components on demand

#### 📦 **Bundle Size**
- **Ant Design**: ~500KB (can be optimized with tree-shaking)
- **Action Required**: 
  - Use Ant Design's tree-shaking
  - Consider `babel-plugin-import` for smaller bundles
  - Monitor bundle size

#### 🔄 **API Optimization**
- **Action Required**: 
  - Debounce search inputs
  - Cache API responses
  - Batch requests if possible
  - Use pagination efficiently

---

### 14. Deployment Considerations

#### 🚀 **Build Configuration**
- **Action Required**: 
  - Configure Vite build settings
  - Set up environment variables
  - Configure base path if needed

#### 🌐 **Hosting**
- **Options**: Vercel, Netlify, GitHub Pages, Docker
- **Decision Needed**: Choose hosting platform
- **Action Required**: 
  - Set up CI/CD pipeline
  - Configure environment variables
  - Set up custom domain (if needed)

#### 📊 **Monitoring**
- **Action Required**: 
  - Set up error tracking (Sentry)
  - Monitor API errors
  - Track user analytics (optional)

---

### 15. Documentation Needs

#### 📚 **Developer Documentation**
- **Action Required**: 
  - Document component props
  - Document API integration
  - Document state management
  - Create README with setup instructions

#### 👥 **User Documentation**
- **Action Required**: 
  - Create user guide (optional)
  - Add tooltips/help text in UI
  - Document error messages

---

## Quick Start Checklist

Before starting Phase 1, ensure:

- [ ] Backend API is running and accessible
- [ ] CORS is configured on backend
- [ ] API base URL is confirmed
- [ ] Node.js 18+ is installed
- [ ] Package manager is chosen (npm/pnpm/yarn)
- [ ] Git repository is set up (or use existing)
- [ ] Design decisions are made (theme, i18n, etc.)
- [ ] Development environment is ready
- [ ] Team members have access (if working in team)

---

## Questions to Answer

1. **Backend URL**: What is the development API URL?
2. **CORS**: Is CORS configured for frontend origin?
3. **Sync Status**: Is there an endpoint to check sync status?
4. **Theme**: Customize Ant Design theme or use defaults?
5. **i18n**: Need multi-language support?
6. **Hosting**: Where will frontend be deployed?
7. **Team**: Who will be working on frontend?
8. **Timeline**: Any specific deadlines or milestones?

---

## Recommended Order of Actions

1. **Verify Backend**: Test API endpoints, confirm CORS
2. **Set Up Project**: Initialize Vite + React + TypeScript
3. **Install Dependencies**: Install Ant Design, Zustand, etc.
4. **Configure Environment**: Set up .env files
5. **Create API Client**: Set up Axios with interceptors
6. **Set Up Routing**: Configure React Router
7. **Create Layout**: Build base layout with Ant Design
8. **Start Phase 2**: Begin authentication implementation

---

**Last Updated**: 2024  
**Status**: Pre-Development Checklist


