# Application Shell Specification: QLHK -> QLNN

> **Source**: Reference Application `QLHK-Client` (`src/components/layout/AppLayout.tsx`, `Header.tsx`, `Sidebar.tsx`, `ConnectionBanner.tsx`)  
> **Target Scope**: Reusable shell layout specification for `QLNN-Client` (`ui-sync/design-language/shell.md`)  
> **Mode**: FORM only. Keeps QLNN existing routes, roles, pages, and data intact while applying the reference shell structure, dimensions, and Tailwind classes.

---

## 1. Shell Root Layout Hierarchy

The application layout uses an unscrollable full-viewport shell containing a fixed top header, an optional system connectivity banner, and a split flex pane consisting of the collapsible navigation sidebar and the vertical scrolling main viewport:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Fixed Header (h-16 / 64px, bg-slate-900, border-b border-slate-800)    │
├────────────────────────────────────────────────────────────────────────┤
│ ConnectionBanner (Optional sticky, bg-gradient rose/amber or emerald) │
├───────────────┬────────────────────────────────────────────────────────┤
│ Sidebar       │ Main Viewport (flex-1 overflow-y-auto p-4 sm:p-6)       │
│ (w-64/w-16    │                                                        │
│ bg-slate-950) │   ┌────────────────────────────────────────────────┐   │
│               │   │ Content Container (w-full max-w-none space-y-6)│   │
│               │   └────────────────────────────────────────────────┘   │
└───────────────┴────────────────────────────────────────────────────────┘
```

### Exact Root Wrapper Classes

```tsx
<div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150">
  <Header />
  <ConnectionBanner {...props} />
  <div className="flex flex-1 overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/30 custom-scrollbar">
      <div className="w-full max-w-none space-y-6">
        {children}
      </div>
    </main>
  </div>
</div>
```

---

## 2. Fixed Header Component (`Header.tsx`)

### 2.1 Container & Dimensions
- **Height**: Exactly `64px` (`h-16`).
- **Position**: `sticky top-0 z-30 select-none`.
- **Styling**: `bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-xs transition-colors duration-150`.

### 2.2 Left Section: Brand & Administrative Unit

```tsx
<div className="flex items-center gap-3">
  {/* Logo Icon Box */}
  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
    <Users className="w-5 h-5" strokeWidth={1.5} />
  </div>

  {/* Titles & Tag */}
  <div>
    <div className="flex items-center gap-2">
      <h1 className="text-sm font-black text-white tracking-tight">
        {APP_TITLE} {/* e.g., QUẢN LÝ NÔNG NGHIỆP */}
      </h1>
      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800 uppercase tracking-wider hidden sm:inline-block">
        {UNIT_TAG} {/* e.g., XÃ ĐĂK HÀ */}
      </span>
    </div>
    <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 hidden sm:block">
      {APP_SUBTITLE}
    </p>
  </div>
</div>
```

### 2.3 Right Section: Controls & Utilities Matrix

```tsx
<div className="flex items-center gap-2.5 sm:gap-3.5">
  {/* 1. Zoom Controls Pill (Hidden on mobile) */}
  <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-slate-300 text-xs">
    <button
      type="button"
      onClick={zoomOut}
      disabled={zoomLevel <= 80}
      title="Thu nhỏ giao diện (Ctrl -)"
      className="p-1.5 hover:bg-slate-700 hover:text-emerald-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      <ZoomOut className="w-3.5 h-3.5" />
    </button>
    <button
      type="button"
      onClick={resetZoom}
      title="Đặt lại 100% (Ctrl 0)"
      className="px-2 py-1 font-mono tabular-nums font-bold text-[11px] hover:text-emerald-400 transition-colors cursor-pointer"
    >
      {zoomLevel}%
    </button>
    <button
      type="button"
      onClick={zoomIn}
      disabled={zoomLevel >= 140}
      title="Phóng to giao diện (Ctrl +)"
      className="p-1.5 hover:bg-slate-700 hover:text-emerald-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      <ZoomIn className="w-3.5 h-3.5" />
    </button>
  </div>

  {/* 2. Theme Toggle (Sun/Moon) */}
  <button
    type="button"
    onClick={toggleTheme}
    aria-label="Chuyển đổi giao diện Sáng / Tối"
    className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-all active:scale-95 border border-slate-700 cursor-pointer"
  >
    {theme === "dark" ? (
      <Sun className="w-4 h-4 text-amber-400" />
    ) : (
      <Moon className="w-4 h-4 text-slate-300" />
    )}
  </button>

  {/* 3. Scope / Village Badge */}
  <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl text-slate-200 text-xs font-bold border border-slate-700">
    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
    <span className="max-w-[140px] truncate">{scopeName || "Toàn xã"}</span>
  </div>

  {/* 4. Network Status & Latency Pill */}
  <button
    type="button"
    onClick={() => setShowStatusModal(true)}
    title="Chẩn đoán kết nối máy chủ"
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
      isOnline && isBackendHealthy
        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60"
        : "bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/60"
    }`}
  >
    {isOnline && isBackendHealthy ? (
      <>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-mono tabular-nums text-[11px]">
          {latency !== null ? `${latency}ms` : "Online"}
        </span>
      </>
    ) : (
      <>
        <WifiOff className="w-3.5 h-3.5 text-rose-400" />
        <span className="font-bold text-[11px]">Ngoại tuyến</span>
      </>
    )}
  </button>

  {/* Vertical Separator */}
  <div className="h-5 w-px bg-slate-700" />

  {/* 5. User Profile & Role Info */}
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
        {user?.username ? user.username.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
      </div>
      <div className="text-left hidden lg:block">
        <div className="text-xs font-black text-slate-200 leading-snug">
          {user?.username || "Cán bộ"}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>{user?.role === "admin" ? "Quản Trị Viên (Admin)" : "Cán Bộ Thôn"}</span>
        </div>
      </div>
    </div>

    {/* Logout Action */}
    <button
      type="button"
      onClick={logout}
      title="Đăng xuất khỏi hệ thống"
      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition-all active:scale-95 cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
    </button>
  </div>
</div>
```

---

## 3. Sidebar Navigation Component (`Sidebar.tsx`)

### 3.1 Dimensions & Collapsing State Engine
- **Expanded Width**: `w-64` (256px).
- **Collapsed Width**: `w-14 sm:w-16` (56px to 64px).
- **Mobile Mode (`< 768px`)**:
  - Drawer slide-out: `max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:shadow-2xl w-64`.
  - Backdrop overlay: `fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200`.
- **Transitions**: `transition-all duration-200 ease-out`.

### 3.2 Sidebar Header (Collapse Trigger)

```tsx
<div className="p-3 flex items-center justify-between border-b border-slate-900 min-h-[56px] overflow-hidden">
  {!isSidebarCollapsed ? (
    <>
      <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2 whitespace-nowrap overflow-hidden">
        <Database className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>DANH MỤC</span>
      </div>
      <button
        type="button"
        onClick={toggleSidebar}
        className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-xl transition-all cursor-pointer shrink-0"
      >
        <PanelLeftClose className="w-4 h-4" />
      </button>
    </>
  ) : (
    <button
      type="button"
      onClick={toggleSidebar}
      className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
    >
      <PanelLeftOpen className="w-4 h-4" />
    </button>
  )}
</div>
```

### 3.3 Navigation Item Matrix

```tsx
<button
  type="button"
  onClick={() => {
    setActiveTab(item.id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }}
  className={`flex items-center gap-3 rounded-2xl transition-all duration-150 relative cursor-pointer overflow-hidden ${
    isSidebarCollapsed
      ? "w-12 h-12 justify-center shrink-0 mx-auto"
      : "w-full py-2.5 px-3 min-h-[48px]"
  } ${
    isActive
      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/30"
      : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50"
  }`}
>
  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : ""}`} />

  <div
    className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-out text-left ${
      isSidebarCollapsed
        ? "max-w-0 opacity-0 pointer-events-none hidden"
        : "max-w-[180px] opacity-100 flex-1 flex flex-col justify-center"
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-[13.5px] tracking-tight font-bold">
        {item.label}
      </span>
      {item.badge && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1.5 ${
            isActive
              ? "bg-emerald-800/90 text-emerald-100"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          {item.badge}
        </span>
      )}
    </div>
    <div
      className={`text-xs truncate mt-0.5 ${
        isActive
          ? "text-emerald-100/90"
          : "text-slate-500 group-hover:text-slate-400"
      }`}
    >
      {item.desc}
    </div>
  </div>
</button>
```

### 3.4 Collapsed Tooltip Flyout

When `isSidebarCollapsed === true`, hovering over any navigation pill reveals an absolute positioned floating badge:

```tsx
<div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700/90 whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
  <div className="flex items-center gap-1.5">
    <span className="text-sm">{item.label}</span>
  </div>
  <div className="text-xs text-slate-400 font-medium mt-0.5">
    {item.desc}
  </div>
</div>
```

### 3.5 Sidebar Footer (System Version)

```tsx
<div className="p-3.5 border-t border-slate-900 bg-slate-950 text-xs text-slate-400 overflow-hidden">
  {!isSidebarCollapsed ? (
    <div className="space-y-1 whitespace-nowrap overflow-hidden">
      <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>QLNN v1.0.0</span>
      </div>
    </div>
  ) : (
    <div className="flex justify-center">
      <ShieldCheck className="w-4 h-4 text-emerald-400" />
    </div>
  )}
</div>
```

---

## 4. Connectivity Banner (`ConnectionBanner.tsx`)

A non-blocking notification bar placed immediately below `<Header />`:

- **Reconnected State**:
  `bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs animate-in slide-in-from-top duration-300`
- **Offline Disconnected State**:
  `bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300`
  - Retry button: `flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-lg text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer`

---

## 5. Viewport Breakpoints & Density Standards

| Breakpoint | Header Adaptations | Sidebar Adaptations | Main Content Density |
| :--- | :--- | :--- | :--- |
| **Mobile (`< 640px`)** | • Hide administrative tag & subtitle<br>• Hide zoom pill<br>• Latency icon-only or compact | Sidebar behaves as a fixed flyout drawer over backdrop (`z-40`) | `p-4`, tables enable smooth horizontal touch scroll |
| **Tablet (`640px - 768px`)** | • Show administrative badge<br>• Show zoom controls | Sidebar defaults to collapsed (`w-14`) | `p-4 sm:p-6`, filter bar wraps into 2 lines |
| **Desktop (`768px - 1024px`)** | • Show scope/village badge | Sidebar can expand to `w-64` or remain `w-16` | `p-6`, side-by-side metric cards |
| **Large Desktop (`≥ 1024px`)** | • Full username and role label visible | Full expanded sidebar (`w-64`) | `p-6`, max-w-none fluid full width grid layout |
