# MongoDB Index Manager - Frontend

Modern React frontend for managing MongoDB database connections and indexes.

---

## 🚀 Quick Start

### Prerequisites
- **Bun** (https://bun.sh/) - Package manager and runtime
- **Node.js 18+** (optional, Bun can run Node.js code)
- **Backend API** running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

The app will be available at `http://localhost:5173`

---

## 📦 Tech Stack

- **React 19** with TypeScript
- **Vite 7** - Build tool and dev server
- **Ant Design 5** - UI component library
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router 6** - Routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

---

## 📁 Project Structure

```
src/
├── api/              # API clients and types
│   ├── client.ts     # Axios instance with interceptors
│   ├── auth.ts       # Authentication API
│   ├── databases.ts  # Database API
│   └── indexes.ts    # Index API
├── components/       # React components
│   ├── auth/         # Auth components ✅
│   ├── layout/       # Layout components ✅
│   ├── databases/    # Database components (Phase 3)
│   ├── collections/  # Collection components (Phase 3)
│   └── indexes/      # Index components (Phase 4)
├── pages/            # Page components
│   ├── Login/        # Login page ✅
│   ├── Register/     # Register page ✅
│   ├── Dashboard/    # Dashboard page ✅
│   ├── Profile/      # Profile page ✅
│   ├── Databases/    # Database pages (Phase 3)
│   ├── Collections/  # Collection pages (Phase 3)
│   └── Indexes/      # Index pages (Phase 4)
├── store/            # Zustand stores
│   └── authStore.ts  # Authentication state ✅
├── hooks/            # Custom React hooks
│   ├── useAuth.ts    # Authentication hook ✅
│   ├── useMessage.ts # Ant Design message hook ✅
│   ├── usePagination.ts # Pagination hook ✅
│   └── useDebounce.ts # Debounce hook ✅
├── utils/            # Utility functions
│   ├── constants.ts  # App constants ✅
│   ├── errorHandler.ts # Error handling ✅
│   ├── formatters.ts # Data formatters ✅
│   ├── token.ts      # Token utilities ✅
│   ├── validation.ts # Validation helpers ✅
│   └── validationSchemas.ts # Zod schemas ✅
├── types/            # TypeScript types
│   ├── api.ts        # API response types ✅
│   ├── auth.ts       # Auth types ✅
│   ├── database.ts   # Database types ✅
│   └── index.ts      # Index types ✅
└── styles/           # Styles and themes
    ├── theme.ts      # Ant Design theme ✅
    └── globals.css   # Global styles ✅
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in `frontend/` directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/doctor-manager-api/v1

# App Configuration
VITE_APP_NAME=MongoDB Index Manager
VITE_ENABLE_DEV_TOOLS=true
```

### Vite Configuration

- **Dev Server**: `http://localhost:5173`
- **Proxy**: `/api` → `http://localhost:8080`
- **Build Output**: `dist/`
- **Code Splitting**: Vendor and UI chunks configured

---

## 🎨 UI Components

### Layout
- **Header**: App title, user menu, logout
- **Sidebar**: Navigation menu (Dashboard, Databases, Indexes)
- **Content Area**: Main content with proper spacing

### Pages Implemented ✅
- **Login**: User authentication
- **Register**: User registration
- **Dashboard**: Overview with statistics
- **Profile**: User profile management

### Pages To Implement 🚧
- **Database List**: List all databases with pagination
- **Database Create/Edit**: Form for database configuration
- **Database Detail**: View database details and collections
- **Collection List**: List collections for a database
- **Index List**: List indexes for a collection
- **Index Create/Edit**: Form for index definition
- **Index Compare**: Compare indexes between manager and database
- **Index Sync**: Sync indexes to database

---

## 🔐 Authentication

### Flow
1. User logs in → receives access and refresh tokens
2. Tokens stored in Zustand store (persisted to localStorage)
3. Access token expires in 10 minutes
4. Auto-refresh 8 minutes before expiry
5. On 401, interceptor refreshes token and retries request

### Protected Routes
- Routes wrapped with `ProtectedRoute` component
- Redirects to `/login` if not authenticated
- Preserves intended destination for post-login redirect

### Token Management
- Tokens stored in localStorage via Zustand persist
- Automatic token injection in API requests
- Token refresh handled automatically
- Logout clears all tokens

---

## 📡 API Integration

### API Client Features
- Base URL configuration
- Request interceptor: Adds Authorization header
- Response interceptor: Handles token refresh
- Error handling: User-friendly error messages
- Auto-refresh: Checks token expiry every minute

### API Endpoints Used
- `/auth/register` - User registration
- `/auth/login` - User login
- `/auth/refresh-token` - Token refresh
- `/auth/profile` - Get/Update user profile
- `/databases/` - Database CRUD (to be implemented)
- `/indexes/` - Index CRUD (to be implemented)

---

## 🎯 Current Status

### ✅ Completed (Phase 1 & 2)
- Project setup and configuration
- Authentication system (login, register, profile)
- Layout components (Header, Sidebar, Layout)
- Protected routes
- Token management
- Form validation with Zod
- Error handling
- UI fixes and improvements

### 🚧 In Progress (Phase 3)
- Database management features
- See `FE_PLAN.md` for detailed tasks

### 📋 Next Steps
1. Implement database list page
2. Create database form (create/edit)
3. Add connection testing
4. Implement database detail page
5. Add collection listing

---

## 🛠️ Development

### Available Scripts

```bash
# Development
bun run dev          # Start dev server with hot reload

# Building
bun run build        # Build for production (TypeScript check + Vite build)
bun run preview      # Preview production build locally

# Code Quality
bun run lint         # Run ESLint
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React + TypeScript
- **Prettier**: Code formatting (if configured)
- **Naming**: PascalCase for components, camelCase for functions

---

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure backend CORS allows `http://localhost:5173`
- Check Vite proxy configuration

#### 401 Unauthorized
- Check if tokens are in localStorage
- Verify token format in Network tab
- Check backend token validation

#### Build Errors
- Run `bun install` to ensure dependencies are installed
- Check TypeScript errors: `bun run build`
- Clear `node_modules` and reinstall if needed

#### UI Layout Issues
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Verify Ant Design CSS is loaded

---

## 📚 Key Files

### Core Files
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Main app component with routing
- `src/api/client.ts` - API client configuration
- `src/store/authStore.ts` - Authentication state

### Important Components
- `src/components/layout/ProtectedRoute.tsx` - Route protection
- `src/components/auth/LoginForm.tsx` - Login form
- `src/hooks/useAuth.ts` - Authentication hook

### Configuration
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies

---

## 📖 Documentation

- **Development Plan**: See `../FE_PLAN.md`
- **API Documentation**: See `../API_DOCUMENTATION.md`
- **Project Context**: See `../PROJECT_CONTEXT.md`

---

## 🔄 State Management

### Zustand Stores

**authStore** (`src/store/authStore.ts`)
- `accessToken`: JWT access token
- `refreshToken`: JWT refresh token
- `user`: User profile data
- `isAuthenticated`: Authentication status
- Actions: `login`, `logout`, `updateProfile`, `refreshAccessToken`

**Future Stores** (to be implemented)
- `databaseStore`: Cache database list
- `indexStore`: Cache indexes by collection

---

## 🎨 Styling

### Ant Design Theme
- Custom theme configuration in `src/styles/theme.ts`
- Primary color: #1890ff (Ant Design default)
- Responsive breakpoints: xs, sm, md, lg, xl, xxl

### Global Styles
- Custom scrollbar styling
- Base font and typography
- Layout reset styles

---

## 🧪 Testing

**Status**: Testing setup deferred for now

**Future**: Can add:
- Vitest for unit tests
- React Testing Library for component tests
- Playwright/Cypress for E2E tests

---

## 📦 Dependencies

### Production
- `react`, `react-dom` - React framework
- `react-router-dom` - Routing
- `antd` - UI component library
- `@ant-design/icons` - Icons
- `zustand` - State management
- `axios` - HTTP client
- `react-hook-form` - Form management
- `zod` - Schema validation
- `@hookform/resolvers` - Form validation integration

### Development
- `typescript` - TypeScript compiler
- `vite` - Build tool
- `@vitejs/plugin-react` - Vite React plugin
- `eslint` - Linting
- Type definitions for React, Node, etc.

---

## 🚀 Deployment

### Build Output
- Production build: `dist/` directory
- Static files ready for deployment
- Code splitting configured (vendor, UI chunks)

### Deployment Options
- **Vercel**: Easy deployment with automatic CI/CD
- **Netlify**: Similar to Vercel
- **Docker**: Build and serve with Nginx
- **Static Hosting**: Any static file host

---

## 📝 Notes

- React 19 compatibility warning with Ant Design (informational)
- Large bundle size due to Ant Design (~600KB) - acceptable for now
- Token auto-refresh runs every minute in browser
- All forms use Zod validation schemas

---

**Last Updated**: 2024  
**Status**: Phase 2 Complete, Phase 3 In Progress
