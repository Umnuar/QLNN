# QLNN-Client Architecture Report

## Overview
This report outlines the structural and architectural issues identified in the **QLNN-Client** codebase (React/Vite/Electron). The goal is to provide a baseline for the architectural optimization phase.

## Ranked Structural Issues

### 1. Monolithic State Management (God Context)
- **File**: [`AppContext.tsx`](file:///C:/Projects/QLNN/QLNN-Client/src/AppContext.tsx)
- **Description**: The application relies on a single massive React Context (`AppContext`) to store completely separate domains of state:
  - **UI State**: Theme, Sidebar collapse, Zoom level, Active tab.
  - **Auth State**: User session, logout.
  - **Data State**: Villages list, selected village ID.
  - **Network State**: Online status, backend health, server latency.
- **Impact**: Any state change (e.g., a latency update every 6 seconds from the heartbeat mechanism) triggers a re-render of every component consuming `useApp()`, which is almost the entire application. This leads to severe performance degradation.

### 2. Massive, Over-Complex Components violating SRP
- **Files**: 
  - [`HouseholdTable.tsx`](file:///C:/Projects/QLNN/QLNN-Client/src/components/households/HouseholdTable.tsx) (47KB, 615 lines)
  - [`HouseholdModal.tsx`](file:///C:/Projects/QLNN/QLNN-Client/src/components/households/HouseholdModal.tsx) (41KB, 827 lines)
  - [`AnalyticsDashboard.tsx`](file:///C:/Projects/QLNN/QLNN-Client/src/components/analytics/AnalyticsDashboard.tsx) (33KB, 661 lines)
- **Description**: These components are far too large and take on too many responsibilities (fetching/updating data, computing derivations, and rendering massive DOM trees). 
- **Impact**: Code is difficult to maintain, test, and read. 

### 3. Anti-Pattern in Form State Management
- **File**: [`HouseholdModal.tsx`](file:///C:/Projects/QLNN/QLNN-Client/src/components/households/HouseholdModal.tsx)
- **Description**: The form uses over 20 individual `useState` hooks to track fields for a single household (e.g., `cafeHousehold`, `pig`, `fishPond`, etc.) instead of a unified state object or a form management library like `react-hook-form`.
- **Impact**: Causes boilerplate bloat, makes resetting or populating forms error-prone, and dramatically increases file size and complexity.

### 4. Tight Component Coupling
- **Description**: Almost every component imports and tightly couples itself to `useApp()`. 
- **Impact**: Components are not reusable outside of this specific application context and are subjected to the re-rendering issues mentioned above.

### 5. Hardcoded Values and Code Duplication
- **Description**: 
  - Hardcoded design values (e.g., mapping villages to specific colors) exist inline inside `HouseholdTable.tsx`.
  - Agricultural indicator structures (18+ items) are repeatedly mapped and calculated inline rather than being extracted into reusable config or utility functions.
  - Inline components like `MiniDonut` are embedded inside `AnalyticsDashboard.tsx` instead of living in a shared `components/ui` folder.
- **Impact**: Changing a color or a metric involves hunting down occurrences across multiple large files.

## Recommendations for Optimization
1. **Split the Context**: Break `AppContext` down into `AuthContext`, `UIContext` (Theme/Sidebar/Zoom), `NetworkContext`, and `DataContext`.
2. **Component Refactoring**: Extract small, reusable components (like `MiniDonut` or `HouseholdSummaryTabs`) out of the massive dashboard and table files.
3. **Form Refactoring**: Refactor `HouseholdModal.tsx` to use a single state object for the form payload, or introduce a form library.
4. **Extract Constants**: Move mapping objects (like village colors) and indicator configuration to a dedicated `constants/` or `config/` directory.
