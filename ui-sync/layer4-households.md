# LAYER 4C IMPLEMENTATION REPORT: HOUSEHOLDS MANAGEMENT & DATA COMPONENTS

**Status**: Completed  
**Branch**: `ui/full-sync`  
**Date**: 2026-10-03  
**Components Verified & Aligned**:
- `QLNN-Client/src/pages/HouseholdsPage.tsx`
- `QLNN-Client/src/components/households/HouseholdFilterBar.tsx`
- `QLNN-Client/src/components/households/HouseholdTable.tsx`
- `QLNN-Client/src/components/households/HouseholdModal.tsx`
- `QLNN-Client/src/components/excel/ImportPreviewModal.tsx`
- `QLNN-Client/src/components/excel/ExportSettingsModal.tsx`

---

## 1. Objectives & Scope
Layer 4C applies the Reference App (QLHK) visual design system to the primary data table, filters, input forms, and spreadsheet workflows, while strictly preserving:
- All 18 agricultural indicators across crops (ha), herbs (ha), livestock (con), and aquaculture (ha/cages).
- 21-column flat-numbered Excel import/export structure with frozen panes (STT and Owner Name).
- OCC 409 concurrency lock handling (`version: Int`) with in-form conflict banner and live reload.
- Full offline caching via IndexedDB with network state detection.

---

## 2. Changes & Parity Verification

### 2.1 HouseholdFilterBar (Island Filter Container)
- Replaced old category pills with compact QLHK island bar (`p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800`).
- Integrated search input with leading search icon, trailing clear button (X), and animated refresh indicator.
- Three standardized `CustomSelect` dropdowns with `sm` size and Lucide icons:
  - Quy mô (Tất cả quy mô, Lớn >2ha/>15 con, Vừa 0.5-2ha, Nhỏ <0.5ha).
  - Loại hình (Tất cả loại hình, Có nhận khoán, Trồng dược liệu, Chăn nuôi gia súc, Nuôi trồng thủy sản).
  - Sắp xếp (Mặc định STT, Diện tích cây trồng ↓, Tổng đàn vật nuôi ↓, Tên A→Z, Tên Z→A).
- Dynamic selection action bar: appears on the right when `selectedCount > 0` with emerald selection badge, "Bỏ chọn", "Xuất Excel", and "Xóa" buttons.

### 2.2 HouseholdTable (5 View Modes + Accordion Expansion)
- 5 View Modes: `Tổng Hợp` (Overview 7 cols), `Cây Trồng` (Crops 8 cols), `Dược Liệu` (Herbs 6 cols), `Vật Nuôi` (Livestock 6 cols), `Thủy Sản` (Aquaculture 4 cols), plus `Tất cả` (Full 21 cols).
- Frozen left sticky columns: Checkbox (`sticky left-0`), STT (`sticky left-10`), Họ và Tên Chủ Hộ (`sticky left-[88px]`), plus Action column (`sticky right-0`).
- Expandable accordion rows for each household showing 18 indicators with category color chips (Emerald, Teal, Amber, Sky).
- Double-click to edit and OCC conflict badge indicator.

### 2.3 HouseholdModal (Drawer/Dialog Shell)
- High-elevation rounded modal shell (`rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl h-[88vh]`).
- Dark header bar with active indicator icon badge (Trees/PawPrint/Fish), household title, and village pill.
- Tab segmented switcher for Trồng trọt / Chăn nuôi / Thủy sản with live subtotal calculation badges.
- OCC 409 error banner with `[ 🔄 Tải Lại Dữ Liệu Mới Nhất ]` button.
- Smart duplicate detection with automatic upsert option.

### 2.4 ImportPreviewModal & ExportSettingsModal
- 21-column flat numbered review table with frozen STT & Owner Name.
- Quick file switcher button ("Đổi Tệp Khác").
- Stepper pagination ("Trước" / "Trang X/Y" / "Sau").
- Export scope selector (all vs selected) with neutral/emerald action buttons.

---

## 3. Verification & Quality Gates
- `src/tests/components/HouseholdFilterBar.test.tsx`: 7/7 tests PASS.
- `src/tests/components/HouseholdForm.test.tsx`: 3/3 tests PASS.
- `src/tests/components/ExcelPreview21Cols.test.tsx`: 5/5 tests PASS.
- Content Invariant Check: 100% of 18 indicators and Vietnamese labels preserved.
