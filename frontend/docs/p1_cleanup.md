# P1: Initial Cleanup Checklist

This checklist is based on the [Initial Cleanup section of the Refactor Plan](REFACTOR_PLAN.md#1-initial-cleanup).

## 1.1. Remove Unused Packages and Components

### Unused devDependencies

The following devDependencies are not used in the project and can be removed:

- `@types/lodash`
- `@types/react-bootstrap-table2-paginator`
- `@types/react-bootstrap-table2-toolkit`
- `babel-eslint`

### Missing dependencies

The following dependencies are used in the project but are not listed in `package.json`:

- `lodash`: used in `src/pages/Pages/Profile/Settings/Settings.js`
- `nouislider`: used in `src/pages/Forms/FormRangeSlider/FormRangeSlider.js`

### Commented-out Code

The following files contain commented-out code that should be reviewed and removed if obsolete:

- `src/Layouts/Header.js`: commented-out imports
- `src/Layouts/Sidebar.js`: commented-out import
- `src/Layouts/index.js`: commented-out imports and actions
- `src/helpers/backend_helper.js`: commented-out API functions

### Console Log Statements

Numerous `console.log` statements are present throughout the codebase. They should be removed for production builds. The most affected areas are:

- `src/slices`
- `src/Routes`
- `src/helpers`
- `src/pages`

### TODO Comments

The following files contain `TODO` comments that should be addressed:

- `src/assets/scss/config/Interactive/_variables.scss`: Technical debt comment `// TODO: remove this in v6`
- `src/pages/Pages/Profile/Settings/Settings.js`: Feature placeholder `_variables.scss`: `{/* TODO: Change password */}`

## 1.2. Template Leftovers

The Velzon template contains many features that are not used in this project. The following sections detail the components, pages, and state management logic that can be safely removed.

### Unused Redux Slices

The following Redux slices are template leftovers and should be removed.

- `src/slices/chat/`
- `src/slices/crypto/`
- `src/slices/ecommerce/`
- `src/slices/invoice/`
- `src/slices/jobs/`
- `src/slices/mailbox/`
- `src/slices/projects/`
- `src/slices/tasks/`
- `src/slices/team/`

### Unused API Helpers

The mock API helper file is not used and can be deleted.

- `src/helpers/fakebackend_helper.js`

### Unused Pages and Components

The document correctly identifies unused page categories. To be more precise, these specific page components within `src/pages/` are likely unused and can be removed:

- `src/pages/Calendar/`
- `src/pages/Chat/`
- `src/pages/Crypto/`
- `src/pages/Ecommerce/`
- `src/pages/Email/`
- `src/pages/Invoices/`
- `src/pages/Jobs/`
- `src/pages/FileManager/`
- `src/pages/Projects/`
- `src/pages/Tasks/`
- `src/pages/Tickets/`
- `src/pages/Crm/`
- `src/pages/Team/`
- `src/pages/ToDo/`

The project contains a large number of pages and components that appear to be unused. They are likely leftover from the template this project was based on. A thorough review of all components under the following directories is recommended to identify and remove unused assets:

- `src/pages/AdvanceUi`
- `src/pages/AuthenticationInner`
- `src/pages/BaseUi`
- `src/pages/Charts`
- `src/pages/Forms`
- `src/pages/Tables`
- `src/pages/Widgets`
- `src/pages/Widgets1`
- Many components under `src/pages/Pages` (e.g., `ComingSoon`, `Faqs`, `Gallery`, etc.)

### Update Routes

After removing the unused pages and components, the route definitions in `src/Routes/allRoutes.js` must be updated to remove the associated routes.

### ESLint Issues

The project is set up with ESLint, but there is no dedicated script to run it. It's recommended to add a `lint` script to `package.json` to be able to check the entire codebase for linting issues.

```json
"scripts": {
  ...
  "lint": "eslint src"
},
```

Running `npm run lint` would then highlight any code quality issues, inconsistencies, and potential bugs.






