# Navigation & Filter Patterns Specification: QLHK -> QLNN

> **Source**: Reference Application `QLHK-Client` (`HouseholdFilterBar.tsx`, `CustomSelect.tsx`, `AgeFilterPopover.tsx`, `YearSelector.tsx`, `TablePagination.tsx`)  
> **Target Scope**: Reusable navigation, filtering, and pagination patterns for `QLNN-Client` (`ui-sync/design-language/patterns-nav-filter.md`)  
> **Mode**: FORM only. Maintains all existing target fields, filters, query parameters, and business logic while enforcing the visual standards and Tailwind classes of the reference app.

---

## 1. Island Filter Container Pattern

All page-level filter blocks in the reference application are styled as an independent floating "island" card sitting directly above the data view:

```tsx
<div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-150">
  {/* Filter elements go here */}
</div>
```

### Invariant Rules
- **Corner Radius**: `rounded-2xl` (never `rounded-lg` or square).
- **Padding**: `p-2.5 sm:p-3` (compact desktop density).
- **Gap**: `gap-2` between all filter pills, inputs, and action buttons.
- **Elevation**: `shadow-xs` with subtle border `border-slate-200/80 dark:border-slate-800`.
- **Responsive Wrapping**: Uses `flex-wrap items-center` so filters flow naturally onto multiple lines on smaller viewports.

---

## 2. Integrated Search Input Pattern

The reference search bar integrates a leading search icon, instant clear (`X`), a vertical divider, and a refresh spinner into a single unified pill.

```tsx
<div className="relative w-56 sm:w-80 shrink-0">
  {/* Leading Icon */}
  <Search
    className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
    strokeWidth={1.5}
  />

  {/* Main Search Input Field */}
  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Tìm kiếm..."
    className="w-full h-8 sm:h-9 pl-8.5 pr-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-medium transition-all"
  />

  {/* Trailing Controls Cluster */}
  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
    {search && (
      <>
        {/* Clear Search Action */}
        <button
          type="button"
          onClick={() => setSearch("")}
          aria-label="Xóa tìm kiếm"
          className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>

        {/* Micro Divider */}
        <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-1" />
      </>
    )}

    {/* Refresh Spinner Trigger */}
    <button
      type="button"
      onClick={onRefresh}
      aria-label="Làm mới danh sách"
      title="Làm mới danh sách"
      className="p-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
    >
      <RefreshCw
        className={`w-3.5 h-3.5 ${
          loading ? "animate-spin text-emerald-600 dark:text-emerald-400" : ""
        }`}
        strokeWidth={1.5}
      />
    </button>
  </div>
</div>
```

---

## 3. OS-Independent CustomSelect Component (`CustomSelect.tsx`)

Native browser `<select>` elements look inconsistent across OS versions and cannot be customized with search or badges. `CustomSelect` replaces all dropdowns with an accessible floating portal.

### 3.1 Size Variants

| Size Prop | Height / Padding | Text Size | Radius | Typical Component Usage |
| :--- | :--- | :--- | :--- | :--- |
| **`size="sm"`** | `h-8 sm:h-9 px-2.5` | `text-xs font-semibold` | `rounded-xl` | Island filter bars, table pagination limit selector |
| **`size="md"`** | `px-3.5 py-2.5 min-h-[42px]` | `text-sm font-medium` | `rounded-xl` | Standard modal form fields, citizen editor |
| **`size="lg"`** | `px-4 py-3 min-h-[48px]` | `text-base font-medium` | `rounded-2xl` | Primary hero dropdowns, setup wizards |

### 3.2 Trigger Button State Classes

```tsx
<button
  type="button"
  className={`w-full flex items-center justify-between gap-2 font-medium transition-all outline-hidden cursor-pointer select-none text-left
    ${
      isActive
        ? "border-emerald-500/80 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
        : "bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600"
    }
    focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
    ${isOpen ? "border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20" : ""}
    ${error ? "border-rose-500 dark:border-rose-500 focus:ring-rose-500/20" : ""}
    ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
    ${sizeStyles.trigger}
  `}
>
  {/* Trigger Content */}
</button>
```

### 3.3 Auto-Flip Direction & Floating Dropdown Container

When vertical clearance below the dropdown container is under `240px`, the menu dynamically flips upward:

```tsx
// Clearance calculation
useEffect(() => {
  if (isOpen && containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpward(spaceBelow < 240);
  }
}, [isOpen]);
```

```tsx
<div
  role="listbox"
  className={`absolute left-0 right-0 z-[120] ${
    openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"
  } bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl shadow-slate-950/20 dark:shadow-slate-950/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
>
  {/* Optional integrated search filter if options.length > 8 */}
  {shouldShowSearch && (
    <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 dark:text-slate-500 pointer-events-none" strokeWidth={1.5} />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm..."
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
        />
      </div>
    </div>
  )}

  {/* Option List Viewport */}
  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
    {options.map((opt) => (
      <button
        key={String(opt.value)}
        type="button"
        role="option"
        onClick={() => handleSelect(opt)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl text-left transition-colors cursor-pointer select-none px-2.5 py-1.5 text-xs ${
          isSelected
            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold"
            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/90"
        }`}
      >
        <span className="truncate">{opt.label}</span>
        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" strokeWidth={2} />}
      </button>
    ))}
  </div>
</div>
```

---

## 4. Action Pill Filters & Popovers

Used for parametric filters such as date ranges, age brackets, or numeric calculation years.

### 4.1 Trigger Pill (Inactive vs Active States)

- **Default Inactive**:
  ```tsx
  className="h-8 sm:h-9 px-2.5 py-1 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-between gap-1.5 shadow-2xs hover:border-emerald-500/50 cursor-pointer select-none transition-all"
  ```
- **Active Filter Applied**:
  ```tsx
  className="h-8 sm:h-9 px-2.5 py-1 text-xs font-semibold rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 flex items-center justify-between gap-1.5 shadow-xs cursor-pointer select-none transition-all"
  ```

### 4.2 Popover Panel Surface

```tsx
<div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 z-50 animate-in fade-in zoom-in-95 duration-100">
  {/* Header with Title and Clear Action */}
  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
      <Icon className="w-4 h-4 text-emerald-500" />
      <span>{POPOVER_TITLE}</span>
    </div>
    {hasValue && (
      <button
        type="button"
        onClick={handleClear}
        className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer"
      >
        Xóa lọc
      </button>
    )}
  </div>

  {/* Body Content / Grid of Preset Buttons */}
  <div className="grid grid-cols-2 gap-1.5">
    {/* Preset items */}
  </div>
</div>
```

### 4.3 "Xóa Lọc" (Reset All Filters) Action Button

Shown conditionally whenever any filter or search term is active:

```tsx
{isFilterActive && (
  <button
    type="button"
    onClick={handleClearAll}
    className="h-8 px-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 animate-in fade-in"
    title="Xóa toàn bộ các bộ lọc đang chọn"
  >
    <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
    <span>Xóa lọc</span>
  </button>
)}
```

---

## 5. Table Pagination Bar (`TablePagination.tsx`)

Rendered at the bottom of data tables, matching the container width and border styles:

```tsx
<div className="p-4 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
  {/* Summary Info */}
  <div className="text-slate-600 dark:text-slate-300 font-medium">
    Hiển thị{" "}
    <strong className="text-slate-900 dark:text-white font-bold font-mono">
      {itemCount}
    </strong>{" "}
    /{" "}
    <strong className="text-slate-900 dark:text-white font-bold font-mono">
      {total}
    </strong>{" "}
    bản ghi
  </div>

  {/* Right Controls */}
  <div className="flex items-center gap-3">
    {/* Page Limit CustomSelect */}
    <div className="flex items-center gap-1.5">
      <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">
        Số dòng:
      </span>
      <CustomSelect<number>
        value={limit}
        onChange={(val) => onLimitChange(Number(val))}
        options={[
          { value: 10, label: "10 dòng" },
          { value: 20, label: "20 dòng" },
          { value: 50, label: "50 dòng" },
          { value: 100, label: "100 dòng" },
        ]}
        size="sm"
        containerClassName="w-28"
        className="font-bold"
      />
    </div>

    {/* Previous / Current Page / Next Stepper */}
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Trang trước"
        className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
      </button>

      <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
        {page} / {totalPages || 1}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Trang tiếp theo"
        className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </div>
  </div>
</div>
```
