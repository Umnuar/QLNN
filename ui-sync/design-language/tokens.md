# Design Language Tokens Specification: QLHK -> QLNN

> **Source**: Reference Application `QLHK-Client` (`src/index.css`, `index.html`, Tailwind v4 Theme)  
> **Target Scope**: Direct synchronization tokens for `QLNN-Client` (`ui-sync/design-language/tokens.md`)  
> **Mode**: FORM only. Strict token extraction with exact Tailwind CSS classes, hex codes, and CSS variable specifications.

---

## 1. Color Palette Tokens

The design uses an **Emerald-primary** palette paired with high-contrast **Slate neutrals** and semantic feedback palettes. Both light mode and dark mode are fully specified.

### 1.1 Primary Accent: Emerald

| Token Name | Hex Code | Tailwind Light Class | Tailwind Dark Class | Primary Usage |
| :--- | :--- | :--- | :--- | :--- |
| **emerald-50** | `#ecfdf5` | `bg-emerald-50`, `text-emerald-700` | `bg-emerald-50/20` | Active pill background, selected row background, soft hover |
| **emerald-100** | `#d1fae5` | `bg-emerald-100`, `border-emerald-200` | `bg-emerald-950/60` | Light status badge background, avatar container |
| **emerald-200** | `#a7f3d0` | `border-emerald-200` | `border-emerald-800` | Soft emerald borders, badge stroke |
| **emerald-300** | `#6ee7b7` | `text-emerald-300` | `text-emerald-300` | Dark mode high-contrast text label |
| **emerald-400** | `#34d399` | `text-emerald-400` | `text-emerald-400` | Dark mode icons, latency indicator icon, KPI accent |
| **emerald-500** | `#10b981` | `bg-emerald-500`, `text-emerald-500` | `bg-emerald-500` | Focus ring tint (`ring-emerald-500/20`), active border (`border-emerald-500`), radio/checkbox accent |
| **emerald-600** | `#059669` | `bg-emerald-600`, `hover:bg-emerald-700` | `bg-emerald-600` | Primary CTA buttons, active sidebar pill, progress bar |
| **emerald-700** | `#047857` | `text-emerald-700`, `hover:bg-emerald-700` | `hover:bg-emerald-700` | Button hover states, high-contrast text on light backgrounds |
| **emerald-800** | `#065f46` | `bg-emerald-800`, `border-emerald-800` | `border-emerald-800` | Gradient start in header banner, dark borders |
| **emerald-900** | `#064e3b` | `bg-emerald-900` | `bg-emerald-900` | Gradient end, dark hover containers |
| **emerald-950** | `#022c22` | `bg-emerald-950` | `bg-emerald-950/60`, `dark:bg-emerald-950/80` | Dark mode badge container, dark active select backgrounds |

### 1.2 Neutral System: Slate

| Scale | Hex Code | Light Mode Usage | Dark Mode Usage |
| :--- | :--- | :--- | :--- |
| **slate-50** | `#f8fafc` | `bg-slate-50` (base canvas, input bg, soft containers) | `text-slate-50` (highest contrast text) |
| **slate-100** | `#f1f5f9` | `bg-slate-100` (table header background, scrollbar track) | `hover:bg-slate-800` |
| **slate-200** | `#cbd5e1` | `border-slate-200/80` (dividers, input borders, pill borders) | `text-slate-200` |
| **slate-300** | `#cbd5e1` | `border-slate-300` (input borders default), scrollbar thumb | `text-slate-300` |
| **slate-400** | `#94a3b8` | `text-slate-400` (subtitles, placeholder text, muted icons) | `text-slate-400` |
| **slate-500** | `#64748b` | `text-slate-500` (secondary labels, metadata) | `text-slate-500` |
| **slate-600** | `#475569` | `text-slate-600` (body text, secondary buttons) | `text-slate-400` |
| **slate-700** | `#334155` | `text-slate-700` (field labels), dark borders | `border-slate-700/60`, dark scrollbar thumb |
| **slate-800** | `#1e293b` | `border-slate-800` | `bg-slate-800` (dark inputs, dark cards, dark popovers) |
| **slate-900** | `#0f172a` | Header background (`bg-slate-900`), body text (`#0f172a`) | `bg-slate-900` (card surface, modals, custom select dropdown) |
| **slate-950** | `#020617` | Overlay backdrop (`bg-slate-950/60`) | Base canvas background (`html.dark body { background: #020617; }`) |

### 1.3 Semantic Badges & Feedback Colors

| Semantic State | Intent / Role | Light Mode Classes | Dark Mode Classes |
| :--- | :--- | :--- | :--- |
| **Success / Thường trú** | Positive state, regular residence | `bg-emerald-50 text-emerald-700 border-emerald-200` | `dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800` |
| **Info / Tạm trú** | Transient status, secondary info | `bg-sky-50 text-sky-700 border-sky-200` | `dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800` |
| **Warning / Tạm vắng** | Temporary absence, caution | `bg-amber-50 text-amber-700 border-amber-200` | `dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800` |
| **Danger / Chuyển đi / Xóa** | Relocated, soft deleted, error | `bg-rose-50 text-rose-700 border-rose-200` | `dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900` |
| **Neutral / Archived** | Neutral metadata, default category | `bg-slate-100 text-slate-600 border-slate-200` | `dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700` |

### 1.4 Selection Token
- **Text Selection**: `selection:bg-emerald-500 selection:text-white` (defined on `<body>`).

---

## 2. Typography Scale & Fonts

### 2.1 Font Families

```css
@theme {
  --font-sans: "Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

- **Primary Sans**: `"Be Vietnam Pro"`. Web font weights imported via Google Fonts: `300`, `400`, `500`, `600`, `700`, italic `400`.
- **Monospace**: `"JetBrains Mono"`. Web font weights: `400`, `500`, `600`. Applied to all numeric quantities, STT counters, CCCD numbers, timestamps, dates, and latency pills:
  ```css
  code, kbd, samp, pre, .font-mono {
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  }
  ```

### 2.2 Base Hierarchy & Size Matrix

| Scale Identifier | Exact CSS / Class | Weight | Tracking / Line Height | Usage In Application |
| :--- | :--- | :--- | :--- | :--- |
| **Body Default** | `15px` / `text-[15px]` | 400 (`font-normal`) | `line-height: 1.55; letter-spacing: -0.01em;` | Global body copy |
| **Badge / Micro** | `10px` / `text-[10px]` | 700 (`font-bold`) | `uppercase tracking-wider` | Role pill, active pulse badge, category tag |
| **Caption / Table Th** | `11px` / `text-[11px]` | 900 (`font-black`) / 700 | `uppercase tracking-wider` | Table `<th>`, helper text, breadcrumbs |
| **Compact / Data** | `12px` / `text-xs` | 500 (`font-medium`) / 700 | `leading-normal` | Table cells, inputs (`size="sm"`), filter dropdowns |
| **Table Cell Text** | `13.5px` / `text-[13.5px]` | 500 / 700 | `-0.01em` | Standard table row data, sidebar item title |
| **Input / Button** | `14px` / `text-sm` | 500 / 600 / 700 | `tracking-tight` | Standard form inputs (`size="md"`), dialog section headers |
| **Card Header / Subtitle** | `16px` / `text-base` | 700 (`font-bold`) / 900 | `tracking-tight` | Modal title, drawer top bar title, section titles |
| **Section Title** | `18px` / `text-lg` | 900 (`font-black`) | `tracking-tight` | Village card title, settings header |
| **Banner Header** | `24px` / `text-2xl` | 900 (`font-black`) | `tracking-tight` | Summary banner heading, overview card stats |
| **Display / Login** | `28px` / `text-[28px]` | 900 (`font-black`) | `tracking-tight` | Login view title |

### 2.3 Number Display Rule
- Every table row number, citizen count, CCCD, age, percentage, or latency metric **MUST** include:
  `font-mono font-bold tabular-nums`

---

## 3. Border Radii Scale

| Class | Pixel Value | Structural Components Applying This Token |
| :--- | :--- | :--- |
| **`rounded-3xl`** | `24px` | • Primary page content cards (`bg-white rounded-3xl border`)<br>• KPI summary cards (`p-5 rounded-3xl`)<br>• System modals (`useModal.tsx`, `ServerStatusModal.tsx`)<br>• Household drawer container (`HouseholdDrawer.tsx`)<br>• File dropzone container (`ExcelPage.tsx`) |
| **`rounded-2xl`** | `16px` | • Island filter bars (`p-2.5 sm:p-3 rounded-2xl border`)<br>• Dropdown popup menus (`CustomSelect.tsx` options container)<br>• Filter popovers (`AgeFilterPopover.tsx`, `YearSelector.tsx`)<br>• Sidebar navigation pill items (`rounded-2xl`)<br>• Action buttons in page headers (`h-10 rounded-2xl`)<br>• Village grid item cards (`rounded-3xl` outer, `rounded-2xl` inner avatar) |
| **`rounded-xl`** | `12px` | • Form text inputs & textareas<br>• Trigger button for `CustomSelect`<br>• Pagination controls (prev, next, page number pill)<br>• Table action buttons (Edit, Delete, Restore)<br>• Small status badges (`px-2.5 py-1 rounded-xl`) |
| **`rounded-lg`** | `8px` | • Stepper +/- adjustment buttons (`YearSelector`)<br>• Table inline sub-table badges (`rounded-lg text-xs font-bold`) |
| **`rounded-full`** | `9999px` | • Status ping indicator dots (`w-2 h-2 rounded-full`)<br>• User avatar circle in header<br>• Scrollbar thumb capsules |

---

## 4. Box Shadows & Elevations

| Tailwind Class | Raw CSS Shadow Value | Component Placement |
| :--- | :--- | :--- |
| **`shadow-2xs`** | `0 1px 2px 0 rgba(0,0,0,0.03)` | Subtle trigger buttons, inline filter pills |
| **`shadow-xs`** | `0 1px 2px 0 rgba(0,0,0,0.05)` | Island filter container, fixed top header, action buttons |
| **`shadow-sm`** | `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` | Page cards, KPI cards, table container wrappers |
| **`shadow-md`** | `0 4px 6px -1px rgba(0,0,0,0.1)` | Active sidebar item (`shadow-emerald-950/30`), save buttons |
| **`shadow-xl`** | `0 20px 25px -5px rgba(0,0,0,0.1)` | Floating dropdown menus (`CustomSelect`), filter popovers |
| **`shadow-2xl`** | `0 25px 50px -12px rgba(0,0,0,0.25)` | Centered dialog modals, slide-over drawer surface |
| **Sticky Column (Left)** | `shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]` | Sticky checkbox & STT columns during horizontal table scroll |
| **Sticky Column (Right)** | `shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]` | Sticky action columns during horizontal table scroll |

---

## 5. Animation & Transition Engine

Tailwind v4 animation polyfill configured directly inside `index.css`:

```css
@keyframes enter {
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), 1) rotate(var(--tw-enter-rotate, 0));
  }
}

.animate-in {
  animation-name: enter;
  animation-duration: var(--animation-duration, 150ms);
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}
```

### 5.1 Standard Animation Combinations

- **Dialog / Modal Open**:  
  `animate-in fade-in zoom-in-95 duration-150`
- **Dropdown / Popover Reveal**:  
  `animate-in fade-in zoom-in-95 duration-100`
- **Banner / Notification Dropdown**:  
  `animate-in slide-in-from-top duration-300`
- **Table Accordion Expansion**:  
  `animate-in fade-in duration-200`
- **Hover Scale Micro-interaction**:  
  `transition-all active:scale-[0.98] sm:hover:scale-[1.01]`
- **Global Theme Transition**:  
  `transition-colors duration-150` on `header`, `aside`, `main`, and dialog shells.

---

## 6. Custom Scrollbar Specification

Applies globally to window, dialog body, and specific `.custom-scrollbar` containers:

```css
/* Custom modern scrollbar (Light & Dark) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9; /* Slate 100 */
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* Slate 300 */
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; /* Slate 400 */
}

html.dark ::-webkit-scrollbar-track {
  background: #0f172a; /* Slate 900 */
}

html.dark ::-webkit-scrollbar-thumb {
  background: #334155; /* Slate 700 */
}

html.dark ::-webkit-scrollbar-thumb:hover {
  background: #475569; /* Slate 600 */
}
```

---

## 7. Lucide Icon Consistency Token
- Global rule:
  ```css
  svg.lucide {
    stroke-width: 1.5;
  }
  ```
- **Standard icon sizes**:
  - `w-3.5 h-3.5`: Filter triggers, dropdown arrows, clear buttons, stepper icons.
  - `w-4 h-4`: Menu icons, table row action buttons, banner indicators.
  - `w-5 h-5`: Modal headers, sidebar item icons, card corner decorative icons.
  - `w-6 h-6`: KPI metric header icons.
