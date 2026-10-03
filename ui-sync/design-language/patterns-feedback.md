# Feedback & Overlay Patterns Specification: QLHK -> QLNN

> **Source**: Reference Application `QLHK-Client` (`HouseholdDrawer.tsx`, `CitizenModal.tsx`, `ServerStatusModal.tsx`, `useModal.tsx`, `ConnectionBanner.tsx`, `HouseholdTable.tsx`)  
> **Target Scope**: Modals, slide-overs, status badges, alerts, spinners, and empty states for `QLNN-Client` (`ui-sync/design-language/patterns-feedback.md`)  
> **Mode**: FORM only. Preserves all target entities, validation rules, and business logic while applying reference visual feedback specifications.

---

## 1. Centered Large Slide-Over / Editor Dialog (`HouseholdDrawer.tsx`)

In the reference design, complex entities with multiple child records (e.g. households with citizens, farms with parcels) utilize a full-viewport blurred backdrop containing a high-elevation, centered card dialog with fixed top and bottom bars.

```tsx
{/* Backdrop */}
<div
  className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
  onClick={handleBackdropClick}
  role="dialog"
  aria-modal="true"
>
  {/* Dialog Shell */}
  <div
    ref={dialogRef}
    className="w-full max-w-3xl h-[88vh] max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 relative"
    onClick={(e) => e.stopPropagation()}
  >
    {/* 1. Fixed Top Bar */}
    <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 shrink-0">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <EntityIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          <span>{DRAWER_TITLE}</span>
        </h2>
        {/* Meta badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {IDENTIFIER_LABEL}: <span className="text-emerald-600 dark:text-emerald-400">{IDENTIFIER_VAL}</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
            {CATEGORY_NAME}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRequestClose}
        aria-label="Đóng cửa sổ"
        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <X strokeWidth={1.5} className="w-5 h-5" />
      </button>
    </div>

    {/* Optional Error Alert inside Drawer */}
    {error && (
      <div className="mx-6 mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
        <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
        <span>{error}</span>
      </div>
    )}

    {/* 2. Scrollable Body Content */}
    <form id="drawer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
      {/* Form sections */}
    </form>

    {/* 3. Fixed Bottom Action Bar */}
    <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 shrink-0">
      <button
        type="button"
        onClick={handleRequestClose}
        className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
      >
        Hủy / Đóng
      </button>

      <button
        type="submit"
        form="drawer-form"
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
    </div>
  </div>
</div>
```

### 1.1 Discard Changes Safety Confirmation Dialog

When `isDirty` is true and the user attempts to close the drawer, an unsaved changes alert intercepts the action:

```tsx
<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
  <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Xác nhận hủy thay đổi
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Dữ liệu chưa được lưu vào hệ thống
        </p>
      </div>
    </div>
    <p className="text-sm text-slate-600 dark:text-slate-300">
      Đồng chí đã chỉnh sửa thông tin. Đồng chí có chắc chắn muốn hủy bỏ các thay đổi này và đóng biểu mẫu không?
    </p>
    <div className="flex items-center justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={() => setShowDiscardConfirm(false)}
        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
      >
        Tiếp tục chỉnh sửa
      </button>
      <button
        type="button"
        onClick={handleForceClose}
        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
      >
        Đồng ý hủy bỏ
      </button>
    </div>
  </div>
</div>
```

---

## 2. Standard Form Modal Pattern (`CitizenModal.tsx`)

Used for focused single-entity creation/editing dialogs:

```tsx
<div
  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
  onClick={onClose}
  role="dialog"
  aria-modal="true"
>
  <div
    ref={modalRef}
    className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2.5">
        <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.5} />
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {MODAL_TITLE}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {MODAL_SUBTITLE}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng cửa sổ"
        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <X strokeWidth={1.5} className="w-5 h-5" />
      </button>
    </div>

    {/* Body Form */}
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Form Fields */}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.99] cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 mr-0.5" strokeWidth={2} />
          <span>Lưu Dữ Liệu</span>
        </button>
      </div>
    </form>
  </div>
</div>
```

---

## 3. Global System Alert & Confirmation Modal (`useModal.tsx`)

Managed via React context (`showModal({ title, message, type: 'danger' | 'warning' | 'success' | 'info' })`):

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
  <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden scale-100 transition-all text-slate-900 dark:text-slate-100">
    <div className="p-6 flex items-start gap-4">
      {/* Semantic Icon Container */}
      <div
        className={`p-3 rounded-2xl shrink-0 ${
          type === "danger"
            ? "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
            : type === "warning"
              ? "bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              : type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
        }`}
      >
        {type === "danger" || type === "warning" ? (
          <AlertTriangle className="w-6 h-6" />
        ) : type === "success" ? (
          <CheckCircle2 className="w-6 h-6" />
        ) : (
          <Info className="w-6 h-6" />
        )}
      </div>

      {/* Message Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={handleCancel}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Actions Bar */}
    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 flex justify-end gap-3">
      {cancelText !== null && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-10 px-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
        >
          {cancelText || "Hủy bỏ"}
        </button>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className={`h-10 px-5 text-xs font-bold text-white rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer ${
          type === "danger"
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        <span>{confirmText || "Xác nhận"}</span>
      </button>
    </div>
  </div>
</div>
```

---

## 4. Status Badges Specification

Badges use compact font sizes (`text-[10px]` or `text-[11px]`), font-bold weights, and subtle border strokes.

### 4.1 Status Badge Class Helper

```ts
export function getStatusBadgeClass(status?: string): string {
  switch (status) {
    case "Thường trú":
    case "active":
    case "Đã duyệt":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    case "Tạm trú":
    case "pending":
    case "Chờ xử lý":
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800";
    case "Tạm vắng":
    case "warning":
    case "Cảnh báo":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    case "Chuyển đi":
    case "deleted":
    case "Đã hủy":
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    default:
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
  }
}
```

### 4.2 Pulsing Active Status Pill

```tsx
<span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
  <span>Hoạt động</span>
</span>
```

---

## 5. Inline Alerts & Banners

### 5.1 Form Level Error Banner

```tsx
<div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" strokeWidth={1.5} />
  <span>{errorMessage}</span>
</div>
```

### 5.2 Header Connectivity Banners

- **Success Reconnected Alert**:
  ```tsx
  <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs animate-in slide-in-from-top duration-300">
    <CheckCircle2 className="w-4 h-4" />
    <span>Đã khôi phục kết nối thành công — Dữ liệu đã được đồng bộ tự động!</span>
  </div>
  ```
- **Offline Mode Alert**:
  ```tsx
  <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
      <span><strong>Mất kết nối tới máy chủ - Đang hoạt động ở chế độ ngoại tuyến</strong></span>
    </div>
    <button onClick={onRetry} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-xs">
      Thử kết nối lại
    </button>
  </div>
  ```

---

## 6. Loading Skeletons & Spinners

### 6.1 Table Row Loading Skeleton State

```tsx
<tr>
  <td colSpan={totalCols} className="py-16 text-center text-slate-400 dark:text-slate-500">
    <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
    <span className="font-bold text-sm">Đang tải dữ liệu...</span>
  </td>
</tr>
```

### 6.2 Button Action Spinner

```tsx
<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
```

---

## 7. Empty State Patterns

### 7.1 Table Empty State

```tsx
<tr>
  <td colSpan={totalCols} className="py-16 text-center text-slate-400 dark:text-slate-500">
    <div className="text-base font-bold text-slate-600 dark:text-slate-300">
      Không tìm thấy dữ liệu phù hợp
    </div>
    <p className="text-xs text-slate-400 mt-1">
      Vui lòng thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc
    </p>
  </td>
</tr>
```

### 7.2 Nested Sub-Entity Empty State (Dashed Container)

```tsx
<div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
  <EmptyIcon className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
  <div>
    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
      Chưa có mục nào trong danh sách
    </h4>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
      Bấm nút "Thêm mới" bên dưới để đăng ký bản ghi đầu tiên.
    </p>
  </div>
  <button
    type="button"
    onClick={onAdd}
    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
  >
    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
    <span>Thêm Mới Ngay</span>
  </button>
</div>
```
