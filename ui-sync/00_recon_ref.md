# REFERENCE APPLICATION RECONNAISSANCE REPORT (QLHK)

**Project Path**: `C:\Users\umnuar\Documents\Projects\QLHK`  
**Inspected Sub-project**: `QLHK-Client`  
**Role**: Source of Truth for **FORM** (Design tokens, shell layout, component patterns, interaction behavior, animations, density, responsive rules)  
**Invariant Principle**: Copy FORM only, keep CONTENT intact  

---

## 1. Technology Stack Analysis

Inspected files: `QLHK-Client/package.json`, `QLHK-Client/postcss.config.js`, `QLHK-Client/vite.config.ts`, `QLHK-Client/index.html`

| Component / Layer | Version / Spec | Notes & Architectural Implications |
| :--- | :--- | :--- |
| **Framework** | `react: ^18.2.0`, `react-dom: ^18.2.0` | React 18 with hooks, Concurrent features, `Suspense`, `lazy()`. |
| **Build Tool** | `vite: ^5.1.6`, `@vitejs/plugin-react: ^4.2.1` | Port 5175, proxy `/api` -> `http://localhost:5002`. Chunking for vendor-react, vendor-icons, vendor-excel. |
| **Styling Engine** | `tailwindcss: ^4.2.4`, `@tailwindcss/postcss: ^4.2.4` | **Tailwind CSS v4 (Pure PostCSS)**. No `tailwind.config.js`. Uses `@theme` and `@custom-variant` inside `src/index.css`. |
| **PostCSS** | `postcss: ^8.5.14` | Configured strictly with `@tailwindcss/postcss: {}`. |
| **Icon Library** | `lucide-react: ^1.14.0` | Global default strokeWidth: `1.5` configured via `@layer base`. |
| **Desktop Shell** | `electron: ^42.1.0`, `electron-builder: ^24.13.3` | Dual preload expose: `window.electronAPI` and `window.api` (interop bridge). |
| **Language & Types** | `typescript: ^5.2.2` | Strict typings, ESNext modules. |
| **State & Store** | Context API + `electron-store: ^8.2.0` + `idb-keyval` / IndexedDB | Offline-first architecture with dual persistence. |
| **Utility Packages** | `axios: ^1.7.9`, `xlsx: ^0.18.5` | Excel import/export via native xlsx parser. |
| **Testing** | `vitest: ^4.1.11`, `@testing-library/react: ^16.3.3` | Full test suite across API, components, DB, security. |
| **Navigation Lib** | `react-router-dom: ^7.15.0` (Installed) | **Critical Finding**: Not used for main view routing. Navigation is 100% state-driven tab switching. |

---

## 2. Routing & Navigation Architecture

Inspected files: `src/App.tsx`, `src/AppContext.tsx`, `src/components/layout/AppLayout.tsx`, `src/components/layout/Sidebar.tsx`

### 2.1 State-Driven Tab Routing Pattern
In `src/App.tsx`, routes are controlled via reactive state `activeTab` from `AppContext`:
```tsx
const { user, isInitializing, activeTab } = useApp();

if (isInitializing) return <InitializingScreen />;
if (!user) return <LoginView />;

return (
  <AppLayout>
    <Suspense fallback={<PageLoadingSpinner />}>
      {activeTab === "villages" && <VillagesPage />}
      {activeTab === "households" && <HouseholdsPage />}
      {activeTab === "analytics" && <AnalyticsPage />}
      {activeTab === "recycle-bin" && <RecycleBinPage />}
      {activeTab === "audit" && (user?.role === "admin" ? <AuditLogView /> : <HouseholdsPage />)}
      {activeTab === "settings" && <SettingsPage />}
    </Suspense>
  </AppLayout>
);
```

### 2.2 Role-Based Navigation Items Matrix (`Sidebar.tsx`)

| Role | Tab ID | Label | Icon | Description | Special Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | `villages` | Quản Lý Thôn | `Map` | Quản lý các thôn xã Đăk Hà | Clears `selectedVillageId` to view all |
| **Admin** | `analytics` | Thống Kê | `BarChart3` | Phân tích nhân khẩu & DTTS | Visible when `selectedVillageId` is active. Has "Chính" badge |
| **Admin** | `households` | Hộ Gia Đình | `Users` | Hộ gia đình & Nhân khẩu | Visible when `selectedVillageId` is active |
| **Admin** | `recycle-bin` | Thùng Rác | `Trash2` | Quản lý hộ dân đã xóa | |
| **Admin** | `audit` | Nhật Ký Hoạt Động | `History` | Lịch sử biến động dữ liệu | Admin-only audit timeline |
| **Admin** | `settings` | Cài Đặt Hệ Thống | `Settings` | Tài khoản & sao lưu | System settings, backup, user assign |
| **User (Trưởng thôn)** | `households` | Hộ Gia Đình | `Users` | Hộ gia đình & Nhân khẩu thôn | Fixed to assigned `village_id` |
| **User (Trưởng thôn)** | `analytics` | Thống Kê | `BarChart3` | Báo cáo số liệu thôn | Has "Chính" badge |
| **User (Trưởng thôn)** | `recycle-bin` | Thùng Rác | `Trash2` | Quản lý hộ dân đã xóa | Village-scoped recycle bin |

---

## 3. Styling & Token Architecture

Inspected files: `src/index.css`, `index.html`, components styling across `src/`

### 3.1 Tailwind v4 Configuration (`src/index.css`)
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: "Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

### 3.2 Typography Scale & Rules
- **Sans-serif Font**: `Be Vietnam Pro` (Weights: 300, 400, 500, 600, 700). Applied globally via `* { font-family: "Be Vietnam Pro", ... }`.
- **Monospace Font**: `JetBrains Mono` (Weights: 400, 500, 600). Enforced via `code, kbd, samp, pre, .font-mono { font-family: "JetBrains Mono", ... !important; }`. Used for: CCCD numbers, years, percentages, record counts, latencies, dates.
- **Base Body**: `font-size: 15px`, `line-height: 1.55`, `letter-spacing: -0.01em`, antialiased.
- **Header Titles**: `text-xl sm:text-2xl font-black tracking-tight`
- **Section Titles**: `text-base font-bold` or `text-sm font-black`
- **Sub-headings / Group Labels**: `text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300`
- **Table Headers**: `text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300`
- **Form Labels**: `text-xs font-bold text-slate-700 dark:text-slate-300`

### 3.3 Color Palette & Semantic Surfaces

| Semantic Role | Light Mode Value | Dark Mode Value | Usage in Reference App |
| :--- | :--- | :--- | :--- |
| **Body Background** | `#f8fafc` (`slate-50`) | `#020617` (`slate-950`) | HTML root / body background |
| **Main Content BG** | `bg-slate-100/70` | `bg-slate-900/30` | `<main>` container wrapping screens |
| **Header Surface** | `bg-slate-900` | `bg-slate-900` | Fixed dark header in both modes |
| **Sidebar Surface** | `bg-slate-950` | `bg-slate-950` | Fixed dark sidebar in both modes |
| **Card Surface** | `bg-white` | `bg-slate-900` | Primary content panels, tables, modals |
| **Inner Pill / Sub-box** | `bg-slate-50` | `bg-slate-800/50` | Filter bars, nested card rows, input wrappers |
| **Border Normal** | `border-slate-200/90` | `border-slate-800` | Standard card and table borders |
| **Border Subtle** | `border-slate-100` | `border-slate-800/60` | Nested row dividers, item separators |
| **Brand Primary (Accent)** | `emerald-600` (`#059669`) | `emerald-500` (`#10b981`) | Primary buttons, active nav, focus rings |
| **Brand Tinted Pill** | `bg-emerald-50 text-emerald-700` | `bg-emerald-950/60 text-emerald-300` | Active filters, status tags, village tags |
| **Brand Dark Gradient** | `from-emerald-800 via-emerald-700 to-emerald-900` | Same | Overview Hero Banner in Villages / Analytics |
| **Info / Gender Male** | `bg-blue-50 text-blue-700` | `bg-blue-950/60 text-blue-300` | Male gender tag, export action, info alerts |
| **Danger / Gender Female**| `bg-rose-50 text-rose-700` | `bg-rose-950/60 text-rose-300` | Female gender tag, delete actions, danger alerts |
| **Warning / Offline** | `bg-amber-50 text-amber-700` | `bg-amber-950/60 text-amber-300` | Offline cache warning badge, sun toggle icon |
| **Ethnic Minorities** | `bg-purple-100 text-purple-700` | `bg-purple-900/40 text-purple-300` | DTTS badge, ethnicity percentages |
| **Temporary Status** | `bg-sky-50 text-sky-700` | `bg-sky-950/60 text-sky-300` | "Tạm trú" residence status |

### 3.4 Corner Radius Scale
- **Outer Shell / Cards / Panels**: `rounded-3xl` (`24px`) — Characteristic QLHK pill/super-ellipse aesthetic.
- **Modals & Drawers**: `rounded-3xl` (`24px`).
- **Buttons (Primary) & Nav Items**: `rounded-2xl` (`16px`).
- **Form Inputs, Selects, Tooltips**: `rounded-xl` (`12px`).
- **Badges, Inline Tags, Checkboxes**: `rounded-md` (`6px`) / `rounded-lg` (`8px`).
- **Avatars, Indicator Dots, Pills**: `rounded-full` (`9999px`).

### 3.5 Shadow Scale
- **Subtle Elevation (Pill / Small button)**: `shadow-xs` / `shadow-2xs`
- **Card Panels**: `shadow-sm`, hover elevation `hover:shadow-md`
- **Active Navigation / Emerald Buttons**: `shadow-md shadow-emerald-950/30`
- **Modals / Floating Popovers / Drawers**: `shadow-2xl`
- **Table Sticky Columns**:
  - Left column: `shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]`
  - Right column: `shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]`

### 3.6 Custom Modern Scrollbars
```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
html.dark ::-webkit-scrollbar-track { background: #0f172a; }
html.dark ::-webkit-scrollbar-thumb { background: #334155; }
html.dark ::-webkit-scrollbar-thumb:hover { background: #475569; }
```

### 3.7 Animation Engine (Tailwind v4 Polyfill)
Defined directly in `src/index.css`:
- Keyframes: `@keyframes enter`, `fadeIn`, `zoomIn95`, `slideInFromTop`, `slideInFromBottom`, `slideInFromRight`.
- Utility classes: `.animate-in`, `.fade-in`, `.zoom-in-95`, `.slide-in-from-*`, `.duration-100/150/200/300`.
- Timing: `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like deceleration).
- Accessibility: `@media (prefers-reduced-motion: reduce) { .animate-in { animation: none !important; } }`.

---

## 4. App Shell & Layout Mechanics

Inspected files: `src/components/layout/AppLayout.tsx`, `Header.tsx`, `Sidebar.tsx`, `ConnectionBanner.tsx`, `ServerStatusModal.tsx`

### 4.1 Shell DOM Structure
```tsx
<div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150">
  <Header />
  <ConnectionBanner isOffline={...} isReconnected={...} onRetry={...} />
  <div className="flex flex-1 overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/30">
      <div className="w-full max-w-none space-y-6">{children}</div>
    </main>
  </div>
</div>
```

### 4.2 Header Bar Mechanics (`Header.tsx`)
- Height: `h-16` (64px), sticky top `z-30`.
- Color: `bg-slate-900 border-b border-slate-800 px-4 sm:px-6`.
- **Left**:
  - Brand Icon: `w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center` with `Users` icon (`w-5 h-5`).
  - App Name: `text-sm font-black text-white tracking-tight`
  - Subtitle Tag: `px-2 py-0.5 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800 uppercase` ("XÃ ĐĂK HÀ")
  - Caption: `text-[11px] text-slate-400 font-medium`
- **Right Controls**:
  1. **Zoom Controls Pill**: `hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-slate-300 text-xs`.
     - Zoom Out: `ZoomOut` icon, disabled at `<= 80%`.
     - Reset Zoom: `px-2 py-1 font-mono tabular-nums font-bold text-[11px]`, sets to `100%`.
     - Zoom In: `ZoomIn` icon, disabled at `>= 140%`.
     - Zoom step: 10%. Electron IPC: `window.electronAPI.setZoom(zoomLevel)`.
     - Global Keyboard shortcuts: `Ctrl =` / `Ctrl +` (Zoom in), `Ctrl -` (Zoom out), `Ctrl 0` (Reset).
  2. **Dark / Light Theme Toggle**: `p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl border border-slate-700`. Toggles `Sun` (amber-400) / `Moon` (slate-300). Adds/removes `.dark` class on `document.documentElement`.
  3. **Village Indicator**: `hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl text-slate-200 text-xs font-bold border border-slate-700`. Displays current village or "Toàn xã".
  4. **Network / Ping Pill (Clickable)**:
     - Online: `bg-emerald-950/60 text-emerald-300 border-emerald-800` with green dot, `Wifi` icon, and latency in ms (`${latency}ms`).
     - Offline: `bg-rose-950/60 text-rose-300 border-rose-800` with `WifiOff` icon and "Ngoại tuyến" text.
     - On click: Opens `ServerStatusModal` showing detailed connection state and latency metrics.
  5. **User Profile & Logout**:
     - Circular Avatar: `w-8 h-8 rounded-full bg-slate-800 border border-slate-700 font-bold text-xs`.
     - Role text: `Shield` icon + "Cán bộ Xã (Admin)" / "Trưởng Thôn".
     - Logout: `LogOut` button with hover `hover:text-rose-400 hover:bg-rose-950/50`.

### 4.3 Sidebar Mechanics (`Sidebar.tsx`)
- Container: `bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none transition-all duration-200 ease-out`.
- Collapsed width: `w-14 sm:w-16` (56-64px).
- Expanded width: `w-64` (256px).
- Mobile responsive behavior: On `< 768px`, auto-collapses. When opened on mobile, renders full-screen backdrop `fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30` and drawer mode `max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:shadow-2xl`.
- Collapse toggle: `PanelLeftClose` (expanded) / `PanelLeftOpen` (collapsed).
- Nav item styling:
  - Active: `bg-emerald-600 text-white shadow-md shadow-emerald-950/30 rounded-2xl`
  - Inactive: `text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-2xl`
  - Collapsed state tooltip: Floating card on hover `absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700/90`.
- Footer: `ShieldCheck` icon + `QLHK v1.0.0`.

---

## 5. Icons Library Conventions

Inspected file: `lucide-react: ^1.14.0`

### 5.1 Stroke Width Rule
- Explicit global rule in `src/index.css`:
  ```css
  svg.lucide {
    stroke-width: 1.5;
  }
  ```
  *(All icons render with fine, refined 1.5px strokes unless an explicit inline override like `strokeWidth={2}` or `2.5` is set for prominent headers).*

### 5.2 Size Conventions Matrix

| Size Class | Pixel Dimensions | Typical Usages in QLHK |
| :--- | :--- | :--- |
| `w-3 h-3` | 12 x 12 px | Sub-role shields, tiny indicator arrows |
| `w-3.5 h-3.5` | 14 x 14 px | Dropdown chevrons, search icons, clear `X`, zoom buttons, retry spinners |
| `w-4 h-4` | 16 x 16 px | Standard button icons (`Edit3`, `Trash2`, `Plus`, `Download`, `Save`), pagination arrows |
| `w-5 h-5` | 20 x 20 px | Sidebar navigation items, modal header icons, brand badge icon |
| `w-6 h-6` | 24 x 24 px | KPI summary cards (`MapPin`, `Home`, `Users`, `Globe`), alert modal type icons |
| `w-7 h-7` | 28 x 28 px | Overview Hero Banner main icon (`BarChart3`) |
| `w-10 h-10` | 40 x 40 px | Login view brand icon |

---

## 6. Shared Component Primitives & Interaction Patterns

### 6.1 `CustomSelect.tsx` (Premier Form Primitive)
- Replaces native HTML `<select>` with a searchable, animated, collision-aware custom dropdown.
- **Auto-Search**: Automatically turns on search filter input if options count > 8 or `searchable={true}`.
- **Smart Viewport Collision**: Detects distance to viewport bottom: if `< 240px`, flips upwards (`bottom-full mb-1.5`) instead of downwards (`top-full mt-1.5`).
- **Focus & Keyboard Navigation**: Auto-focuses search input when opened. Closes on click outside or Escape key.
- **Sizes**:
  - `sm`: `h-8 sm:h-9 px-2.5 text-xs font-semibold rounded-xl` (Used in filter bars and pagination)
  - `md`: `px-3.5 py-2.5 text-sm rounded-xl min-h-[42px]` (Used in modal forms)
  - `lg`: `px-4 py-3 text-base rounded-2xl min-h-[48px]`
- **Active State**: If value selected, applies subtle emerald tint: `border-emerald-500/80 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300`.

### 6.2 `TablePagination.tsx`
- Left: `Hiển thị [itemCount] / [total] bản ghi` (`strong` text in dark/light).
- Right:
  - Rows per page selector: `CustomSelect<number>` (`10 dòng`, `20 dòng`, `50 dòng`, `100 dòng`) with `size="sm" w-28`.
  - Page stepper:
    - Previous button: `ChevronLeft` in `p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800`
    - Page badge: `px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-xs` (`${page} / ${totalPages}`)
    - Next button: `ChevronRight` in same rounded-xl style.

### 6.3 Data Table & Nested Accordions (`HouseholdTable.tsx`)
- Container: `bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col`.
- Table head: `bg-slate-100/90 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider`.
- Sticky Columns:
  - Column 1 (Checkbox): `sticky left-0 z-20 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]`
  - Column 9 (Actions): `sticky right-0 z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]`
- Expandable Nested Rows: Clicking a row toggles accordion to show full sub-table with:
  - Left green border highlight: `border-l-2 border-l-emerald-500`
  - Inline action: `+ Thêm Nhân Khẩu` button
  - Masked CCCD reveal toggle (`toggleRevealCccd`) with `Eye` / `EyeOff` icons and cached decrypted storage
  - Sub-table columns: STT, Họ và Tên, Quan Hệ, Giới Tính, Ngày Sinh, Tuổi, CCCD, Dân Tộc, Tôn Giáo, Ghi Chú, Thao Tác.

### 6.4 Slide-Over / Centered Drawer (`HouseholdDrawer.tsx`)
- Triggered for Create and Edit operations.
- Implementation: Large center modal dialog (`w-full max-w-3xl h-[88vh] rounded-3xl shadow-2xl`) with backdrop blur `bg-slate-950/60 backdrop-blur-xs`.
- Header: Fixed top bar with Home icon, head member name, village badge, status badge, and close button.
- Body: Single smooth vertical scroll container (`overflow-y-auto p-6 space-y-6`).
  - Block 1: General household information (Village, Status, Address, Notes).
  - Block 2: Household members list with card-row layout, CCCD reveal, edit/remove buttons, and `+ Thêm Nhân Khẩu` button.
- Footer: Fixed bottom action bar with `Hủy / Đóng` button and primary `Lưu Thông Tin Hộ` (`Save` icon, emerald button).
- Dirty Checking: Compares initial JSON snapshot; if modified and user closes, presents `showDiscardConfirm` dialog ("Xác nhận hủy thay đổi").

### 6.5 System Modals & Alerts (`useModal.tsx` & `ServerStatusModal.tsx`)
- Standard modal design token:
  - Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs`
  - Card: `bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden`
  - Type-based icon badges:
    - Danger: `bg-rose-50 text-rose-600 border-rose-200` with `AlertTriangle`
    - Warning: `bg-amber-50 text-amber-600 border-amber-200` with `AlertTriangle`
    - Success: `bg-emerald-50 text-emerald-600 border-emerald-200` with `CheckCircle2`
    - Info: `bg-blue-50 text-blue-600 border-blue-200` with `Info`
  - Footer buttons: `rounded-xl`, cancel button `bg-slate-100 dark:bg-slate-800`, confirm button `bg-emerald-600` or `bg-rose-600`.

### 6.6 Native SVG Charts (`AnalyticsDashboard.tsx`)
- In accordance with minimalism (zero charting library bloat):
  - MiniDonut: Handcrafted pure SVG `<circle>` donut chart with `-rotate-90`, stroke-dasharray/dashoffset calculations, centered percentage text, and side-by-side metric cards.
  - ProgressBar: Pure CSS/Tailwind progress bar for percentage distributions.

---

## 7. Open Questions / Items to Clarify with User

1. **Tailwind Version Alignment**: QLHK uses Tailwind CSS v4 (`@tailwindcss/postcss: ^4.2.4`, pure PostCSS with `@theme`), whereas QLNN may currently use Tailwind v3 (`tailwind.config.js`). Will QLNN upgrade to Tailwind v4 in Layer 1 or adopt the design tokens into Tailwind v3 `tailwind.config.js` syntax? *(Recommended: Adopt tokens into Tailwind v3 config or upgrade to v4 depending on QLNN dependencies).*
2. **Top-Level Navigation Architecture**: QLHK uses purely state-based tab routing (`activeTab`), while QLNN might use `react-router-dom` URL paths (`/households`, `/villages`). In accordance with the invariant principle (keep CONTENT and routing logic intact), QLNN's router should remain, but be wrapped in QLHK's App Shell & Sidebar presentation.
3. **Form Density / 18 Indicators**: QLNN manages agricultural indicators (water, electricity, waste, etc.). QLHK's `HouseholdDrawer` layout with two structured blocks (General Info + Member List) will be the pattern for hosting QLNN's indicator forms without losing any QLNN fields.
