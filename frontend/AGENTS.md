# Agent Instructions for `sigpro-doctor-manager-web`

This document provides instructions for AI agents working on the `sigpro-doctor-manager-web` codebase.

## Project Overview

This is a React.js application bootstrapped with Create React App. It uses Redux Toolkit for state management, React Router for navigation, and SCSS for styling.

## Essential Commands

- **`npm start`**: Runs the app in development mode.
- **`npm test`**: Launches the test runner in interactive watch mode.
- **`npm run build`**: Builds the app for production to the `build` folder.

## Code Organization

The `src` directory is organized as follows:

- **`assets/`**: Contains static assets like images, fonts, and SCSS files.
- **`Components/`**: Shared React components used across the application.
- **`Layouts/`**: Components that define the overall structure of the application (e.g., Header, Sidebar, Footer).
- **`pages/`**: Top-level components for different application pages/views.
- **`Routes/`**: Routing configuration using `react-router-dom`.
- **`slices/`**: Redux Toolkit slices, reducers, and thunks for state management.
- **`helpers/`**: Helper functions for API calls, authentication, and other utilities.
- **`common/`**: Contains constants and language files.
- **`locales/`**: i18n translation files.

## Naming Conventions & Style

- **Components**: PascalCase (e.g., `MyComponent.js`).
- **Files**: PascalCase for components, camelCase for other files.
- **Styling**: SCSS is used for styling. Global styles are in `src/assets/scss/`.

## Testing

- The project uses React Testing Library for component testing.
- Test files are located next to the component they are testing (e.g., `App.test.js`).
- Run tests using the `npm test` command.

## Gotchas & Non-Obvious Patterns

- **State Management**: The application uses Redux Toolkit. State logic is organized into slices within the `src/slices` directory.
- **API Calls**: API calls are managed through helper functions in `src/helpers/api_helper.js` and `src/helpers/backend_helper.js`.
- **Authentication**: Authentication logic is handled in `src/helpers/jwt-token-access/` and the `auth` slice.
- **Routing**: Routes are defined in `src/Routes/allRoutes.js` and the main router is in `src/Routes/index.js`.
