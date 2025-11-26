# MongoDB Index Manager - Project Context

**Last Updated**: 2024  
**Purpose**: Preserve key context for project continuity

---

## 📋 Project Overview

**MongoDB Index Manager** - A web application for managing MongoDB database connections and their indexes.

- **Frontend**: React + TypeScript + Vite + Ant Design
- **Backend**: Go-based API (see API_DOCUMENTATION.md)
- **Project Structure**: Monorepo with `frontend/` directory

---

## ✅ Current Status

### Completed Phases

#### Phase 1: Foundation ✅ COMPLETED
- ✅ Project initialized with React + TypeScript + Vite
- ✅ Ant Design v5 configured with theme
- ✅ API client with Axios and interceptors
- ✅ Token management utilities
- ✅ Base layout components (Header, Sidebar, Layout)
- ✅ Zustand stores for state management
- ✅ Routing structure with React Router v6
- ✅ Environment configuration

#### Phase 2: Authentication ✅ COMPLETED
- ✅ Login page and form with validation
- ✅ Registration page and form with validation
- ✅ Auth store with token persistence
- ✅ Token refresh logic (auto-refresh before expiration)
- ✅ Protected route wrapper
- ✅ Profile page and form
- ✅ Logout functionality
- ✅ Error handling
- ✅ Zod validation schemas

### Current Phase

#### Phase 3: Database Management 🚧 IN PROGRESS
- [ ] Database list page with pagination
- [ ] Database search functionality
- [ ] Database form (create/edit)
- [ ] Connection test feature
- [ ] Database detail page
- [ ] Delete with confirmation
- [ ] Collection list component
- [ ] Error handling
- [ ] Loading and empty states

### Upcoming Phases

- **Phase 4**: Index Management
- **Phase 5**: Comparison & Sync
- **Phase 6**: Polish & Optimization
- **Phase 7**: Documentation & Polish

---

## 🛠️ Technology Stack

### Core
- **React**: 19.2.0 (with TypeScript)
- **TypeScript**: 5.9.3 (strict mode)
- **Vite**: 7.2.2 (build tool)

### UI Framework
- **Ant Design (antd)**: 5.28.1
- **@ant-design/icons**: 6.1.0

### State Management
- **Zustand**: 5.0.8 (with persist middleware)

### API & Routing
- **Axios**: 1.13.2 (API client)
- **React Router DOM**: 7.9.5

### Forms & Validation
- **React Hook Form**: 7.66.0
- **Zod**: 4.1.12 (schema validation)
- **@hookform/resolvers**: 5.2.2

### Package Manager
- **Bun**: Latest (fast JavaScript runtime)

---

## 📁 Project Structure

```
mongo-index-manager/
├── frontend/                    # Frontend application
│   ├── src/
│   │   ├── api/                # API clients (auth, databases, indexes)
│   │   ├── components/         # React components
│   │   │   ├── auth/          # Auth components (LoginForm, RegisterForm, ProfileForm)
│   │   │   ├── layout/        # Layout components (Header, Sidebar, Layout, ProtectedRoute)
│   │   │   ├── databases/     # Database components (to be implemented)
│   │   │   ├── collections/   # Collection components (to be implemented)
│   │   │   └── indexes/      # Index components (to be implemented)
│   │   ├── pages/             # Page components
│   │   │   ├── Login/         # Login page ✅
│   │   │   ├── Register/      # Register page ✅
│   │   │   ├── Dashboard/     # Dashboard page ✅
│   │   │   ├── Profile/        # Profile page ✅
│   │   │   ├── Databases/     # Database pages (to be implemented)
│   │   │   ├── Collections/   # Collection pages (to be implemented)
│   │   │   └── Indexes/       # Index pages (to be implemented)
│   │   ├── store/             # Zustand stores
│   │   │   └── authStore.ts   # Auth state ✅
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useAuth.ts     # Auth hook ✅
│   │   │   ├── useMessage.ts  # Message hook ✅
│   │   │   ├── usePagination.ts # Pagination hook ✅
│   │   │   └── useDebounce.ts # Debounce hook ✅
│   │   ├── utils/             # Utility functions
│   │   │   ├── constants.ts   # App constants ✅
│   │   │   ├── errorHandler.ts # Error handling ✅
│   │   │   ├── formatters.ts  # Data formatters ✅
│   │   │   ├── token.ts       # Token utilities ✅
│   │   │   ├── validation.ts  # Validation helpers ✅
│   │   │   └── validationSchemas.ts # Zod schemas ✅
│   │   ├── types/             # TypeScript types
│   │   │   ├── api.ts         # API types ✅
│   │   │   ├── auth.ts        # Auth types ✅
│   │   │   ├── database.ts     # Database types ✅
│   │   │   └── index.ts       # Index types ✅
│   │   └── styles/            # Styles
│   │       ├── theme.ts       # Ant Design theme ✅
│   │       └── globals.css    # Global styles ✅
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── FE_PLAN.md                  # Complete development plan
├── API_DOCUMENTATION.md        # Backend API documentation
├── PROJECT_CONTEXT.md         # This file
└── .gitignore
```

---

## 🔑 Key Decisions Made

### Project Structure
- **Frontend Location**: `frontend/` directory (monorepo approach)
- **Package Manager**: Bun (for faster installs and scripts)
- **Testing**: Deferred for now (can be added later)

### Architecture Decisions
- **State Management**: Zustand (lightweight, simple)
- **Form Validation**: Zod schemas with Ant Design Form
- **API Client**: Axios with interceptors for token management
- **Token Storage**: localStorage via Zustand persist middleware
- **Theme**: Ant Design default theme (customizable)

### UI/UX Decisions
- **Design System**: Ant Design v5 components
- **Layout**: Fixed sidebar + header layout
- **Responsive**: Desktop and tablet focus (mobile optional)
- **Color Scheme**: Ant Design defaults (primary: #1890ff)

---

## 🔌 API Configuration

### Base URLs
- **Frontend Dev**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080`
- **API Base Path**: `/api/doctor-manager-api/v1`

### Environment Variables
```bash
VITE_API_BASE_URL=http://localhost:8080/api/doctor-manager-api/v1
VITE_APP_NAME=MongoDB Index Manager
VITE_ENABLE_DEV_TOOLS=true
```

### API Client Features
- Automatic token injection via request interceptor
- Token refresh on 401 errors
- Auto-refresh before expiration (8 minutes before expiry)
- Error handling and transformation

---

## 📝 Important Implementation Details

### Authentication Flow
1. User logs in → receives `access_token` and `refresh_token`
2. Tokens stored in Zustand store (persisted to localStorage)
3. Access token expires in 10 minutes
4. Refresh token expires in 24 hours
5. Auto-refresh happens 8 minutes before access token expiry
6. On 401, interceptor attempts refresh and retries request

### Protected Routes
- `ProtectedRoute` component checks authentication
- Redirects to `/login` if not authenticated
- Preserves intended destination for redirect after login

### Form Validation
- Zod schemas for all forms (login, register, profile, database, index)
- Integrated with Ant Design Form components
- Client-side validation before API calls

---

## 🐛 Known Issues & Solutions

### Fixed Issues
1. ✅ **UI Layout Issues**: Fixed conflicting CSS in `index.css`
2. ✅ **Login Flow**: Fixed token storage before profile fetch
3. ✅ **Ant Design Messages**: Fixed by wrapping app with `App` component
4. ✅ **Text Truncation**: Fixed layout spacing and CSS conflicts

### Current Considerations
- React 19 compatibility warning with Ant Design (informational, not blocking)
- Large bundle size warning (Ant Design ~600KB) - acceptable for now

---

## 📚 Key Files Reference

### Documentation
- `FE_PLAN.md` - Complete development plan with all phases
- `API_DOCUMENTATION.md` - Backend API reference
- `PROJECT_CONTEXT.md` - This file (current status)

### Configuration
- `frontend/vite.config.ts` - Vite build config with proxy
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/package.json` - Dependencies and scripts

### Core Implementation
- `frontend/src/api/client.ts` - Axios instance with interceptors
- `frontend/src/store/authStore.ts` - Authentication state
- `frontend/src/components/layout/` - Layout components
- `frontend/src/utils/validationSchemas.ts` - Zod schemas

---

## 🚀 Quick Start Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint
```

---

## 📋 Next Steps (Phase 3)

1. **Database List Page**
   - Create `DatabaseListPage` component
   - Implement pagination with `usePagination` hook
   - Add search functionality with debounce
   - Display databases in table/card format

2. **Database Form**
   - Create `DatabaseForm` component
   - Form fields: name, description, URI, db_name
   - Add connection test button
   - Validation with Zod schema

3. **Database Detail Page**
   - Show database information
   - List collections with index counts
   - Actions: Edit, Delete, Test Connection

4. **Collection List Component**
   - Display collections for a database
   - Show index counts per collection
   - Link to index management

---

## 💡 Tips for Context Preservation

### When Starting New Conversation
1. Reference this file: "See PROJECT_CONTEXT.md for current status"
2. Mention current phase: "Working on Phase 3: Database Management"
3. Reference FE_PLAN.md: "See FE_PLAN.md for complete plan"
4. Mention key files: "Frontend code in frontend/ directory"

### When Context is Exhausted
1. Create new conversation
2. Attach: `PROJECT_CONTEXT.md`, `FE_PLAN.md`, `API_DOCUMENTATION.md`
3. Mention: "Continuing from Phase 3, see PROJECT_CONTEXT.md for status"
4. Specify what needs to be done next

---

## 📞 Support & Resources

- **Development Plan**: See `FE_PLAN.md`
- **API Reference**: See `API_DOCUMENTATION.md`
- **Frontend Setup**: See `frontend/README.md`
- **Arch Linux Setup**: See `SETUP.md` (if exists)

---

**Note**: Keep this file updated as the project progresses. Update the "Current Status" section and "Next Steps" regularly.

