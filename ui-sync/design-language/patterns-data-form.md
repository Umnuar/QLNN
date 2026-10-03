# Data & Form Patterns Specification: QLHK -> QLNN

> **Source**: Reference Application `QLHK-Client` (`HouseholdTable.tsx`, `RecycleBinTable.tsx`, `HouseholdDrawer.tsx`, `CitizenModal.tsx`, `AnalyticsDashboard.tsx`, `VillagesPage.tsx`)  
> **Target Scope**: Reusable data tables, cards, form controls, and action button patterns for `QLNN-Client` (`ui-sync/design-language/patterns-data-form.md`)  
> **Mode**: FORM only. Keeps all QLNN data tables, schemas, columns, forms, inputs, and business logic intact while enforcing exact reference styling and Tailwind classes.

---

## 1. Data Tables Specification

The reference application implements a high-density, horizontal-scrolling administrative table structure with frozen (sticky) first and last columns.

### 1.1 Outer Card & Top Helper Bar

```tsx
<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors duration-150">
  {/* Top Info Bar */}
  <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
      <TableIcon className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
      <span>{TABLE_TITLE}</span>
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
      <span className="text-emerald-500 font-bold mr-1">•</span>
      <span>{HELPER_TIP}</span>
    </div>
  </div>

  {/* Horizontal Scrollable Table Wrapper */}
  <div className="overflow-x-auto custom-scrollbar">
    <table className="w-full text-left border-collapse text-xs">
      {/* thead & tbody */}
    </table>
  </div>

  {/* Pagination */}
  <TablePagination {...paginationProps} />
</div>
```

### 1.2 Table Header (`<thead>`) & Sticky Columns

```tsx
<thead>
  <tr className="bg-slate-100/90 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider">
    {/* Sticky Left: Selection Checkbox Column */}
    <th className="py-3 px-2 text-center w-10 border-r border-slate-200/80 dark:border-slate-800 sticky left-0 z-20 bg-slate-100 dark:bg-slate-950 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]">
      <input
        type="checkbox"
        className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
        checked={isAllSelected}
        onChange={onToggleSelectAll}
      />
    </th>

    {/* Center Columns */}
    <th className="py-3 px-3 text-center w-12 border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
      STT
    </th>
    <th className="py-3 px-4 min-w-[200px] border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
      Tên Đối Tượng
    </th>
    <th className="py-3 px-3.5 min-w-[130px] border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
      Phân Loại / Đơn Vị
    </th>
    <th className="py-3 px-3 text-center w-24 border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
      Số Lượng
    </th>
    <th className="py-3 px-3 text-center border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
      Trạng Thái
    </th>

    {/* Sticky Right: Action Column */}
    <th className="py-3 px-3 text-center min-w-[90px] sticky right-0 z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] bg-slate-100 dark:bg-slate-950 shadow-xs whitespace-nowrap">
      Thao Tác
    </th>
  </tr>
</thead>
```

### 1.3 Table Body (`<tbody>`) Rows & Interaction States

```tsx
<tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
  {data.map((row, idx) => {
    const isSelected = selectedIds.includes(row.id);
    const isExpanded = expandedIds.includes(row.id);

    // Dynamic background class for sticky columns during horizontal pan
    const stickyBgClass = isSelected
      ? "bg-emerald-50 dark:bg-emerald-950 group-hover:bg-emerald-100/70 dark:group-hover:bg-emerald-900/60"
      : isExpanded
        ? "bg-emerald-50/20 dark:bg-slate-800/40 group-hover:bg-emerald-50/40 dark:group-hover:bg-slate-800/60"
        : "bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80";

    return (
      <tr
        key={row.id}
        onClick={() => onRowClick(row.id)}
        className={`hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors group text-[13.5px] cursor-pointer ${
          isExpanded ? "bg-emerald-50/20 dark:bg-slate-800/30" : ""
        }`}
      >
        {/* Sticky Left Checkbox */}
        <td
          className={`py-3 px-2 border-r border-slate-100 dark:border-slate-800/60 text-center sticky left-0 z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-colors ${stickyBgClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
            checked={isSelected}
            onChange={() => onToggleSelect(row.id)}
          />
        </td>

        {/* STT (Monospace) */}
        <td className="py-3.5 px-3 border-r border-slate-100 dark:border-slate-800/60 text-center font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {idx + 1}
        </td>

        {/* Primary Name */}
        <td className="py-3.5 px-4 border-r border-slate-100 dark:border-slate-800/60 whitespace-nowrap">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {row.name}
          </div>
          {row.subtext && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
              {row.subtext}
            </div>
          )}
        </td>

        {/* Numerical Metric */}
        <td className="py-3.5 px-3 border-r border-slate-100 dark:border-slate-800/60 text-center w-24 whitespace-nowrap">
          <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {row.count}
          </span>
        </td>

        {/* Status Badge */}
        <td className="py-3.5 px-3 border-r border-slate-100 dark:border-slate-800/60 text-center whitespace-nowrap">
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getStatusBadgeClass(row.status)}`}>
            {row.status}
          </span>
        </td>

        {/* Sticky Right Actions */}
        <td
          className={`py-3.5 px-3 text-center sticky right-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] shadow-xs whitespace-nowrap transition-colors border-b border-slate-100 dark:border-slate-800/60 ${stickyBgClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(row)}
              title="Chỉnh sửa"
              className="p-1.5 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 strokeWidth={1.5} className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row)}
              title="Xóa bản ghi"
              className="p-1.5 text-slate-400 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 strokeWidth={1.5} className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
```

### 1.4 Inline Sub-Table Accordion Pattern

For nested entities (e.g., household members, parcel sub-plots, inspection logs):

```tsx
<tr className="bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800/80 animate-in fade-in duration-200">
  <td colSpan={totalCols} className="p-3 pl-8 border-l-2 border-l-emerald-500">
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {SUB_TABLE_TITLE} ({items.length})
          </h4>
        </div>
        <button
          type="button"
          onClick={onAddSubItem}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Thêm Mới</span>
        </button>
      </div>
      {/* Sub items flat table */}
    </div>
  </td>
</tr>
```

---

## 2. Card Patterns

### 2.1 Standard KPI Metric Card

```tsx
<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
  <div>
    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {METRIC_LABEL}
    </div>
    <div className="text-2xl font-black font-mono tabular-nums mt-1 text-slate-900 dark:text-white">
      {value.toLocaleString("vi-VN")}
    </div>
    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
      {SUB_LABEL}
    </div>
  </div>
  <MetricIcon className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0" strokeWidth={1.5} />
</div>
```

### 2.2 Interactive Grid Item Card (e.g., Village / Area Card)

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={onClick}
  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 min-h-[160px] flex flex-col justify-between"
>
  <div>
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2 min-w-0">
        <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.5} />
        <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight truncate">
          {title}
        </h4>
      </div>
      {/* Quick Action cluster */}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
      {details}
    </div>
  </div>

  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs mt-3">
    <span className="font-bold text-slate-700 dark:text-slate-300">{stat1}</span>
    <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] tabular-nums">{stat2}</span>
  </div>
</div>
```

### 2.3 Hero Overview Banner Card (Emerald Gradient)

```tsx
<div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white shadow-xl shadow-emerald-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
  <div className="flex items-center gap-4 relative z-10">
    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
      <BarChart3 className="w-7 h-7 text-white" strokeWidth={1.5} />
    </div>
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-[11px] font-bold uppercase tracking-wider">
          {TAG}
        </span>
      </div>
      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
        {BANNER_TITLE}
      </h2>
      <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
        {BANNER_SUBTITLE}
      </p>
    </div>
  </div>
</div>
```

### 2.4 Danger Zone Card Pattern

```tsx
<div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-sm overflow-hidden transition-colors">
  <div className="p-6 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 flex items-center">
    <div className="bg-rose-100 text-rose-600 p-2.5 rounded-2xl mr-4 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
      <ShieldAlert className="h-5 w-5" strokeWidth={1.5} />
    </div>
    <div>
      <h3 className="text-base font-black uppercase tracking-tight text-rose-700 dark:text-rose-400">
        Vùng Tác Vụ An Toàn & Phiên Làm Việc (Danger Zone)
      </h3>
      <p className="text-xs font-medium mt-0.5 text-rose-600/70 dark:text-rose-400/70">
        Các thao tác tác động trực tiếp đến dữ liệu và hệ thống
      </p>
    </div>
  </div>
  <div className="p-6 md:p-8 space-y-6">
    {/* Danger action rows */}
  </div>
</div>
```

---

## 3. Form Fields & Input Standards

### 3.1 Standard Input Styling Class

The standard input class string used uniformly in modals, drawers, and pages:

```ts
export const STANDARD_INPUT_CLASSES =
  "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all outline-hidden bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 dark:focus:border-emerald-500 dark:focus:ring-2 dark:focus:ring-emerald-500/20";
```

### 3.2 Form Group Layout

```tsx
<div>
  <label htmlFor="field-id" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
    {LABEL} {isRequired && <span className="text-rose-500 ml-1">*</span>}
  </label>
  <input
    id="field-id"
    type={type}
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder={placeholder}
    className={STANDARD_INPUT_CLASSES}
  />
  {error && (
    <p className="mt-1 text-xs text-rose-500 font-medium animate-in fade-in">
      {error}
    </p>
  )}
</div>
```

---

## 4. Button Variants Specification

### 4.1 Primary CTA (Emerald)

```tsx
<button
  type="submit"
  disabled={loading}
  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer"
>
  {loading ? (
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  ) : (
    <Save strokeWidth={1.5} className="w-4 h-4" />
  )}
  <span>Lưu Thông Tin</span>
</button>
```

### 4.2 Neutral Secondary Button (Slate)

```tsx
<button
  type="button"
  onClick={onClose}
  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
>
  Hủy / Đóng
</button>
```

### 4.3 Danger Confirm Button (Rose)

```tsx
<button
  type="button"
  onClick={onConfirmDelete}
  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer active:scale-[0.99]"
>
  Xóa Vĩnh Viễn
</button>
```

### 4.4 Icon-Only Table Row Buttons

- **Edit Action**:
  ```tsx
  <button
    type="button"
    onClick={onEdit}
    className="p-1.5 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-xl transition-colors cursor-pointer"
  >
    <Edit3 strokeWidth={1.5} className="w-4 h-4" />
  </button>
  ```
- **Delete Action**:
  ```tsx
  <button
    type="button"
    onClick={onDelete}
    className="p-1.5 text-slate-400 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-xl transition-colors cursor-pointer"
  >
    <Trash2 strokeWidth={1.5} className="w-4 h-4" />
  </button>
  ```
- **Restore Action**:
  ```tsx
  <button
    type="button"
    onClick={onRestore}
    className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl transition-colors cursor-pointer"
  >
    <RotateCcw strokeWidth={1.5} className="w-4 h-4" />
  </button>
  ```
