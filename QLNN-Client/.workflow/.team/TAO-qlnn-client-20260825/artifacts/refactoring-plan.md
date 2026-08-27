# Refactoring Plan: QLNN-Client

This prioritized plan addresses the architectural issues identified in the codebase, targeting the reduction of technical debt and improving performance and maintainability.

## Phase 1: Context Decoupling (Fixing the God Context)
**Target:** `src/AppContext.tsx` and all consumers.

### Actions:
1. **Create Specialized Contexts:**
   - **`AuthContext`**: Manages user session and login/logout state.
   - **`UIContext`**: Manages Theme, Sidebar collapse, Zoom level, and Active tab.
   - **`NetworkContext`**: Manages Online status, backend health, and server latency.
   - **`DataContext`**: Manages global domain data (e.g., Villages list, selected village ID).
2. **Refactor Consumers:**
   - Find all usages of `useApp()` and replace them with the specific hooks (e.g., `useAuth()`, `useUI()`, `useNetwork()`) based on what each component actually needs.
3. **Outcome:** Prevents unnecessary re-renders of the entire application when localized state (like latency heartbeat) updates.

## Phase 2: Form State Optimization
**Target:** `src/components/households/HouseholdModal.tsx`

### Actions:
1. **Consolidate State:**
   - Refactor the 20+ individual `useState` hooks into a single unified form state object (e.g., `const [formData, setFormData] = useState<HouseholdPayload>(initialState)`).
2. **Implement Generic Handlers:**
   - Create generic `handleChange` functions to update specific fields in the unified object, reducing boilerplate bloat.
3. **Outcome:** Dramatically reduces file size, simplifies form resetting, and decreases the likelihood of state synchronization bugs.

## Phase 3: Component Decomposition
**Targets:** 
- `src/components/households/HouseholdTable.tsx`
- `src/components/households/HouseholdModal.tsx`
- `src/components/analytics/AnalyticsDashboard.tsx`

### Actions:
1. **Extract UI Components:**
   - Extract inline components like `MiniDonut` from `AnalyticsDashboard.tsx` and move them to `src/components/ui/`.
2. **Break Down Complex Views:**
   - `HouseholdTable.tsx`: Separate table headers, row components, and pagination controls into smaller files.
   - `HouseholdModal.tsx`: Extract different sections of the form (e.g., Demographics, Agricultural Data) into smaller child components that receive `formData` and `onChange` handlers as props.
   - `AnalyticsDashboard.tsx`: Extract complex chart configurations and summary sections into child components.
3. **Outcome:** Adherence to the Single Responsibility Principle, easier testing, and improved readability.

## Phase 4: Configuration and Constants Extraction
**Targets:** All large components with inline data.

### Actions:
1. **Extract Constants:**
   - Move mapping objects (like mapping villages to specific colors in `HouseholdTable.tsx`) to `src/constants/themeConfigs.ts` or similar.
2. **Extract Logic/Configs:**
   - Extract agricultural indicator structures (18+ items) from components and move them to reusable configuration files or utility functions in a `src/utils/` directory.
3. **Outcome:** Centralized configuration that allows changes (like adding a new village color or updating an indicator) to be made in one place without touching component logic.
