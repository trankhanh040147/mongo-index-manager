# Comprehensive Refactor Plan for SigPro Doctor Manager Web

- [ ] ## 1. Cleanup
- [ ] ### 1.1. Remove Unused Packages and Components

- [ ] ## 2. Code Quality & Consistency
- [ ] ### 2.1. Eliminate Direct DOM Manipulation
- [ ] **Goal**: Adhere to React's declarative nature and avoid direct DOM access.
- [ ] **Action**:
  - [ ] Replace `document.getElementById`, `document.querySelector`, etc., with React Refs (`useRef`).
  - [ ] For `document.title`, use a library like `react-helmet-async` or a custom hook to manage the title declaratively.
- [ ] **Affected Files**: `src/pages/Databases/DatabaseList/index.js`, `src/pages/Databases/DatabaseList/List.js`, and potentially others.

- [ ] ## 3. Routing
- [ ] ### 3.1. Modernize React Router v6 Usage
- [ ] **Goal**: Simplify and optimize the routing structure using the latest React Router v6 features.
- [ ] **Action**:
  - [ ] **Remove `exact` prop**: It's no longer needed in React Router v6.
  - [ ] **Use Nested Routes for Layouts**: Instead of wrapping each route in a layout component, create nested route configurations. This is a more idiomatic and efficient way to handle layouts.
- [ ] **Affected Files**: `src/Routes/index.js`, `src/Routes/allRoutes.js`.

**Example of Nested Routes:**
```jsx
// src/Routes/index.js
import { Routes, Route } from "react-router-dom";
import NonAuthLayout from "../Layouts/NonAuthLayout";
import VerticalLayout from "../Layouts/index";
import { authProtectedRoutes, publicRoutes } from "./allRoutes";
import { AuthProtected } from './AuthProtected';

const Index = () => {
    return (
        <Routes>
            <Route element={<NonAuthLayout />}>
                {publicRoutes.map((route, idx) => (
                    <Route path={route.path} element={route.component} key={idx} />
                ))}
            </Route>

            <Route element={<AuthProtected><VerticalLayout /></AuthProtected>}>
                {authProtectedRoutes.map((route, idx) => (
                    <Route path={route.path} element={route.component} key={idx} />
                ))}
            </Route>
        </Routes>
    );
};
```

- [ ] ## 4. Component Structure & Responsibilities
- [ ] ### 4.1. Break Down "God" Components
- [ ] **Goal**: Improve maintainability and readability by breaking down large components into smaller, single-responsibility components.
- [ ] **Action**:
  - [ ] **`DatabaseList/List.js`**: This component is a prime candidate. It should be broken down into:
    - [ ] `DatabaseList.js`: The main container component that fetches data and manages state.
    - [ ] `DatabaseTable.js`: A component that only renders the table of databases.
    - [ ] `DatabaseModals.js`: A component that handles all the modals (create, edit, delete, import, export).
- [ ] **Affected Files**: `src/pages/Databases/DatabaseList/List.js`.

- [ ] ### 4.2. Create Reusable Components
- [ ] **Goal**: Reduce code duplication and promote consistency.
- [ ] **Action**:
  - [ ] **Modal Component**: Create a generic `Modal` component that can be reused for all modal dialogs.
  - [ ] **Form Components**: The forms for creating/editing, exporting, and importing databases are very similar. They can be abstracted into a single `DatabaseForm` component that takes the necessary props.
- [ ] **Affected Files**: `src/pages/Databases/DatabaseList/List.js`.

- [ ] ## 5. State Management
- [ ] ### 5.1. Consolidate `useEffect` Hooks
- [ ] **Goal**: Simplify component lifecycle logic and avoid unexpected side effects.
- [ ] **Action**:
  - [ ] Review all `useEffect` hooks in `DatabaseList/List.js` and consolidate them where possible. For example, the effects that depend on `databaseLists` can be combined into a single effect.
- [ ] **Affected Files**: `src/pages/Databases/DatabaseList/List.js`.

- [ ] ### 5.2. Custom Hooks for Complex Logic
- [ ] **Goal**: Extract complex logic from components into reusable custom hooks.
- [ ] **Action**:
  - [ ] **`useDatabaseList` hook**: Create a custom hook that encapsulates the logic for fetching, paginating, and searching the database list. This will significantly clean up the `DatabaseList` component.
  - [ ] **`useDatabaseForm` hook**: Create a custom hook to manage the Formik form state and submission logic.
- [ ] **Affected Files**: `src/pages/Databases/DatabaseList/List.js`.

- [ ] ## 6. Styling
- [ ] ### 6.1. Abstract Reactstrap Components
- [ ] **Goal**: As mentioned in `AGENTS.md`, decouple the application from `reactstrap` to allow for future UI framework migrations.
- [ ] **Action**:
  - [ ] Create wrapper components for commonly used `reactstrap` components like `Button`, `Card`, `Modal`, `Input`, etc., in the `src/Components/Common` directory.
- [ ] **Affected Files**: All files that use `reactstrap` components.

- [ ] ## 7. API Layer (Thunks)
- [ ] ### 7.1. Standardize API Responses
- [ ] **Goal**: Ensure consistent error handling and data shapes from the API.
- [ ] **Action**:
  - [ ] Review the Redux thunks (`src/slices/database/thunk.js`, etc.) and ensure they handle API errors consistently.
  - [ ] Use a common API client (e.g., Axios instance) with interceptors to handle common tasks like adding auth headers and logging errors.
- [ ] **Affected Files**: All files in `src/slices/*/thunk.js`.

- [ ] ## 8. Final Polish
- [ ] ### 8.1. Improve Logging
- [ ] **Goal**: Replace unstructured `console.log` statements with a more robust logging strategy.
- [ ] **Action**: 
  - [ ] Search for all occurrences of `console.log` and evaluate if they are still needed.
  - [ ] For necessary logs, replace them with a proper logging library (e.g., `pino`, `log-level`) to provide different log levels (debug, info, warn, error) and control log output in different environments.
- [ ] **Affected Files**: Primarily `src/pages/Databases/DatabaseList/List.js`, but a global search is required.
