# CROSS-APPLICATION ARCHITECTURE MAP: QLHK vs QLNN

Mapping of Page -> Component -> CSS Architecture for both applications to ensure 100% visual parity while keeping 100% of target content, columns, APIs, and Vietnamese labels intact.

---

## 1. REFERENCE APPLICATION MAP (QLHK)
**Source of FORM**: `C:\Users\umnuar\Documents\Projects\QLHK\QLHK-Client`

| Page / Route | Core Components | CSS & Token Sources | Visual Patterns / FORM |
| :--- | :--- | :--- | :--- |
| **App Shell** | `src/App.tsx`<br>`src/components/layout/AppLayout.tsx`<br>`src/components/layout/Header.tsx`<br>`src/components/layout/Sidebar.tsx` | `src/index.css`<br>(Tailwind v4 `@theme`, `@custom-variant dark`, Google Fonts `Be Vietnam Pro`, `JetBrains Mono`) | • Top Header: fixed `h-16`, ping indicator with EMA, Zoom buttons (80-140%), Dark/Light toggle, User profile.<br>• Sidebar: collapsible `w-16` / `w-64`, active emerald pill, tooltip hover, `localStorage` memory.<br>• Main container: padding `p-4 sm:p-6`, independent vertical scroll. |
| **Auth** | `src/components/auth/LoginView.tsx` | `src/index.css`<br>(Emerald gradient, rounded-3xl container, glassmorphism) | • Centered card `max-w-md rounded-3xl p-8`.<br>• Clear input focus rings, inline error alert `bg-rose-50 text-rose-700 border-rose-200`.<br>• Lucide eye/eye-off toggle. |
| **Villages (Địa bàn)** | `src/pages/VillagesPage.tsx` | `src/index.css`<br>(Emerald gradient cards, badge pills) | • Hero Emerald Banner: dark green gradient, rounded-3xl, overview summary.<br>• 4 Summary Metric Cards: MapPin, Users, etc.<br>• 7-Villages Card Grid: rounded-2xl, hover border emerald, quick action buttons. |
| **Households (Hộ tịch)** | `src/pages/HouseholdsPage.tsx`<br>`src/components/households/HouseholdFilterBar.tsx`<br>`src/components/households/HouseholdTable.tsx`<br>`src/components/households/HouseholdDrawer.tsx`<br>`src/components/households/CitizenModal.tsx`<br>`src/components/common/TablePagination.tsx` | `src/index.css`<br>(`.custom-scrollbar`, sticky table rules, drawer slide-in animation) | • Island Filter Bar: search input with clear/refresh, filter dropdowns, expand/collapse, quick action buttons.<br>• Sticky Table: `border-separate border-spacing-0`, sticky STT and Name columns, accordion row expand.<br>• Drawer: fixed `max-w-2xl` right slide-over with fixed top/bottom bars.<br>• Modal: centered `rounded-3xl` for secondary edits. |
| **Analytics (Thống kê)** | `src/pages/AnalyticsPage.tsx`<br>`src/components/analytics/AnalyticsDashboard.tsx` | `src/index.css`<br>(Native SVG Donut, progress bars) | • 4 Top KPI Cards with trend badges.<br>• Native SVG Donut Chart (Gender/Religion).<br>• Ethnic group progress bars.<br>• Cross-village comparison table. |
| **Recycle Bin (Thùng rác)** | `src/pages/RecycleBinPage.tsx`<br>`src/components/households/RecycleBinTable.tsx` | `src/index.css`<br>(Rose/Purple semantic badges) | • Cascade restore action, danger modal for permanent deletion, deletion timestamp. |
| **Audit Log (Nhật ký)** | `src/components/audit/AuditLogView.tsx` | `src/index.css`<br>(Timeline connectors, visual diffs) | • Event filter pills (All, Create, Update, Delete, Restore, Import).<br>• Friendly Vietnamese diff: strikethrough red old -> bold green new. |
| **Settings (Cài đặt)** | `src/pages/SettingsPage.tsx` | `src/index.css`<br>(Tabbed settings cards, rounded-3xl) | • 4 clean tabs: Profile, User Management, DB Backup & Restore, About/Version info. |

---

## 2. TARGET APPLICATION MAP (QLNN)
**Target of OVERHAUL**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client`

| Page / Route | Core Components | CSS & Token Sources | CONTENT to Preserve (Strict Invariant) |
| :--- | :--- | :--- | :--- |
| **App Shell** | `src/App.tsx`<br>`src/components/Layout/AppLayout.tsx`<br>`src/components/Layout/Header.tsx`<br>`src/components/Layout/Sidebar.tsx` | `src/index.css`<br>(Needs typography & token alignment with QLHK) | • Navigation state & role-scoping: Admin (Villages, Analytics, Households, RecycleBin, Audit, Settings) & Officer (Village-scoped).<br>• Connection banner & server health logic. |
| **Auth** | `src/components/auth/LoginView.tsx` | `src/index.css` | • Vietnamese credentials placeholders, username/password auth flow, offline session recovery. |
| **Villages (Địa bàn)** | `src/pages/VillagesPage.tsx` | `src/index.css` | • 7 villages of Đăk Hà (Thôn 1..5, Kon Đao Yôp, Kon Hnông Bách).<br>• Agricultural summary counts: Total households, Crops area (ha), Livestock count (con). |
| **Households (Hộ NN)** | `src/pages/HouseholdsPage.tsx`<br>`src/components/households/HouseholdFilterBar.tsx`<br>`src/components/households/HouseholdTable.tsx`<br>`src/components/households/HouseholdModal.tsx`<br>`src/components/excel/ImportPreviewModal.tsx`<br>`src/components/excel/ExportSettingsModal.tsx`<br>`src/components/common/TablePagination.tsx` | `src/index.css` | • **18 Agricultural Indicators** across 5 view modes (Tổng Hợp, Cây Trồng, Dược Liệu, Vật Nuôi, Thủy Sản).<br>• Scale filter (>2ha / >15 con), Production type filter, Sort criteria.<br>• **21 Excel Columns** Smart-Upsert review table.<br>• OCC Lock (`version: Int`) conflict handling.<br>• Batch delete, Village scoping. |
| **Analytics (Thống kê NN)** | `src/pages/AnalyticsPage.tsx`<br>`src/components/analytics/AnalyticsDashboard.tsx` | `src/index.css` | • Crops totals (Cà phê, Cao su, Mắc ca, Dược liệu, Cây ăn quả...).<br>• Livestock totals (Trâu, Bò, Heo, Gia cầm).<br>• Aquaculture totals (Ao cá, Lồng bè).<br>• Village comparison breakdown. |
| **Recycle Bin (Thùng rác)** | `src/pages/RecycleBinPage.tsx`<br>`src/components/households/RecycleBinTable.tsx` | `src/index.css` | • Soft-deleted household records, crop/livestock cascade restore, admin permanent purge. |
| **Audit Log (Nhật ký)** | `src/components/audit/AuditLogView.tsx` | `src/index.css` | • Historical diffs of 18 agricultural indicators, officer usernames, timestamps, IP addresses. |
| **Settings (Cài đặt)** | `src/pages/SettingsPage.tsx`<br>`src/components/settings/BackupRestoreTab.tsx` | `src/index.css` | • Profile, 7 village officers assignment, snapshot backup/restore with admin password confirmation. |

---

## 3. COMPONENT LEVEL EQUIVALENCE & ADAPTATION MATRIX

```
+-----------------------------------+-----------------------------------+-----------------------------------+
| TARGET COMPONENT (QLNN)           | REFERENCE PATTERN (QLHK)          | ADAPTATION STRATEGY               |
+-----------------------------------+-----------------------------------+-----------------------------------+
| AppLayout / Header / Sidebar      | AppLayout / Header / Sidebar      | Direct 1:1 adoption of styling,   |
|                                   |                                   | tokens, and collapse mechanics.   |
| CustomSelect.tsx                  | CustomSelect.tsx                  | Direct 1:1 replacement with OS-   |
|                                   |                                   | independent flip dropdown.        |
| TablePagination.tsx               | TablePagination.tsx               | Direct 1:1 adoption of layout,    |
|                                   |                                   | CustomSelect, and page jumping.   |
| HouseholdFilterBar.tsx            | HouseholdFilterBar.tsx            | Adopt Island styling, inline      |
|                                   |                                   | search, refresh button, & pills.  |
| HouseholdTable.tsx                | HouseholdTable.tsx                | Adopt sticky columns, row borders,|
| (18 indicators)                   | (Household + Citizens)            | monospace font for tabular nums.  |
| HouseholdModal.tsx                | HouseholdDrawer.tsx               | Transform centered modal into     |
| (18 indicators edit)              |                                   | right slide-over Drawer with sticky|
|                                   |                                   | action bar, preserving 18 inputs. |
| ImportPreviewModal.tsx            | ImportPreviewModal.tsx            | Retain 21 columns, apply sticky   |
| (21 columns)                      | (11 columns)                      | STT & Name with reference tokens. |
| AnalyticsDashboard.tsx            | AnalyticsDashboard.tsx            | Retain agriculture metrics, apply |
|                                   |                                   | reference SVG charts & card vibes.|
+-----------------------------------+-----------------------------------+-----------------------------------+
```
