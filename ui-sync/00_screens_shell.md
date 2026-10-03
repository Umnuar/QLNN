# SCREEN & MICRO-STATE INVENTORY: APP SHELL, AUTH & GLOBAL LAYOUT

**Source Application (Target of Overhaul)**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client`  
**Reference Application (Source of FORM)**: `C:\Users\umnuar\Documents\Projects\QLHK\QLHK-Client`  
**Catalog Scope**: App Shell, Authentication, Navigation, and Global Layout Micro-States  
**Invariant Principle**: Copy FORM only (colors, surfaces, borders, radii, shadows, spacing, typography, animations, responsive drawer mechanics). Keep 100% CONTENT intact (Vietnamese labels, placeholders, titles, routes, data bindings, OCC locks, and role permissions).

---

## 1. COMPONENT INVENTORY MATRIX

| # | Component | File Path | Core Role | State Count | Key DOM Nodes |
|---|-----------|-----------|-----------|:-----------:|---------------|
| 1 | **LoginView** | `src/components/auth/LoginView.tsx` | Authentication screen, credential form, error alert, offline session recovery | 6 | Card container, Sprout branding, username/password inputs, eye toggle, submit button, security footer |
| 2 | **App & AppContext** | `src/App.tsx`<br>`src/AppContext.tsx` | Splash screen, active tab state machine, theme engine, zoom IPC, EMA heartbeat | 8 | Initializing splash, root dark class toggle, zoom keybinding handler, network listener, role-based router |
| 3 | **AppLayout** | `src/components/Layout/AppLayout.tsx` | Master shell layout, header/sidebar/banner placement, main view scrollport | 3 | Full-screen wrapper, header slot, connection banner slot, sidebar slot, scrollable main viewport |
| 4 | **Header** | `src/components/Layout/Header.tsx` | Top system bar, brand identity, zoom +/- pill, dark mode toggle, ping pill, user profile | 9 | Sticky header, Sprout logo, brand typography, zoom buttons, theme button, ping latency badge, user avatar, logout button |
| 5 | **Sidebar** | `src/components/Layout/Sidebar.tsx` | Role-based navigation, contextual menu items, collapse/expand toggle, hover tooltips | 8 | Aside rail, collapse button, navigation pills, badge 'Chính', description labels, tooltip overlay, version footer |
| 6 | **ConnectionBanner** | `src/components/network/ConnectionBanner.tsx` | Real-time network failure and recovery notification banner | 3 | Slide-in reconnected banner, slide-in offline alert banner, retry spinner button |
| 7 | **ServerStatusModal** | `src/components/network/ServerStatusModal.tsx` | Modal dialog displaying server health status and real-time EMA ping latency | 4 | Backdrop blur, modal dialog, focus trap, server health card, ping latency card |
| 8 | **ErrorBoundary** | `src/components/common/ErrorBoundary.tsx` | Global unhandled React error boundary fallback screen | 2 | Full-screen error viewport, alert icon, error message and stack trace pre block, reload button |

**Total Components Catalogued**: 8  
**Total Micro-States Catalogued**: 35+

---

## 2. DETAILED COMPONENT CATALOG

### 2.1 LoginView (`src/components/auth/LoginView.tsx`)

#### A. DOM Structure & Tree
```
div.min-h-screen.w-screen.bg-slate-50.dark:bg-slate-950.flex.items-center.justify-center.p-4.sm:p-6
└── div.max-w-md.w-full.bg-white.dark:bg-slate-900.border.border-slate-200.dark:border-slate-800.rounded-2xl.p-6.sm:p-8.shadow-xl.border-t-4.border-t-emerald-600
    ├── div.text-center.mb-5.sm:mb-6 (Header Branding)
    │   ├── div.w-14.h-14.sm:w-16.sm:h-16.bg-emerald-100.dark:bg-emerald-950/60.rounded-full (Sprout Icon)
    │   ├── h1.text-2xl.sm:text-[26px].font-black (Title: "Đăng nhập")
    │   └── p.text-[10.5px].sm:text-[11px].font-bold.text-slate-500 (Subtitle: "QUẢN LÝ NÔNG NGHIỆP...")
    ├── div.mb-4.p-3.bg-rose-50.border.border-rose-200.rounded-xl (Conditional Error Alert)
    │   ├── AlertCircle.w-4.h-4.text-rose-600
    │   └── span.text-xs (Error text)
    ├── form.space-y-4 (Form onSubmit={handleLogin})
    │   ├── div (Username Field Group)
    │   │   ├── label[for="login-username"] ("Tên đăng nhập")
    │   │   └── div.relative
    │   │       ├── div.absolute.inset-y-0.left-0.pl-3.5 (UserIcon.w-5.h-5)
    │   │       └── input#login-username[type="text"][placeholder="Nhập tài khoản"] (ref={usernameRef})
    │   ├── div (Password Field Group)
    │   │   ├── label[for="login-password"] ("Mật khẩu")
    │   │   └── div.relative
    │   │       ├── div.absolute.inset-y-0.left-0.pl-3.5 (Lock.w-5.h-5)
    │   │       ├── input#login-password[type="password"|"text"][placeholder="Nhập mật khẩu"]
    │   │       └── button[type="button"].absolute.inset-y-0.right-0.pr-3.5 (Eye / EyeOff toggle)
    │   └── button[type="submit"].w-full.h-12.bg-emerald-600 ("ĐĂNG NHẬP" | animate-spin spinner)
    └── div.mt-4.pt-3.border-t.border-slate-100.dark:border-slate-800.text-center (Security Footer)
        └── p.text-xs.text-slate-500 (ShieldCheck icon + "Bảo mật dữ liệu Nông nghiệp...")
```

#### B. Vietnamese Text & Content Invariants (MUST BE PRESERVED)
- Page Title: `Đăng nhập`
- System Subtitle: `QUẢN LÝ NÔNG NGHIỆP & NÔNG THÔN MỚI — XÃ ĐĂK HÀ`
- Username Label: `Tên đăng nhập`
- Username Placeholder: `Nhập tài khoản`
- Password Label: `Mật khẩu`
- Password Placeholder: `Nhập mật khẩu`
- Password Visibility Aria: `Ẩn mật khẩu` / `Hiện mật khẩu`
- Submit Button Label: `ĐĂNG NHẬP`
- Footer Security Note: `Bảo mật dữ liệu Nông nghiệp & Nông thôn mới Xã Đăk Hà`
- Validation Error: `Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.`
- Invalid Response Error: `Phản hồi đăng nhập không hợp lệ.`
- Network/Fallback Error: `Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc kết nối mạng.`

#### C. States & Edge Cases
1. **Initial / Clean State**: Username & password inputs are blank. Username input automatically receives focus on mount via `usernameRef.current?.focus()`. Error alert is hidden (`error === null`). Submit button is enabled.
2. **Input Focused State**: Focus ring triggers `focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`.
3. **Password Masked / Unmasked State**: `showPassword` toggle flips input type between `"password"` (shows `Eye` icon) and `"text"` (shows `EyeOff` icon). `tabIndex={-1}` on eye button prevents accidental focus stealing during tab navigation.
4. **Submitting / Loading State**: `loading === true`. Submit button is disabled (`disabled={loading}`, `opacity-50`, `cursor-not-allowed`). Button text `"ĐĂNG NHẬP"` is replaced by spinning circular indicator: `<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />`.
5. **Error Alert State**: Triggered when API call rejects or required fields are missing. Displays rose-tinted box (`bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60`) with `AlertCircle` icon and exact Vietnamese error message.
6. **Narrow Viewport (360px mobile)**: Container padding drops from `sm:p-8` to `p-6`. Branding icon scales from `sm:w-16 sm:h-16` to `w-14 h-14`. Title scales from `sm:text-[26px]` to `text-2xl`. Input height remains `h-12` (48px touch target).
7. **Offline Session Recovery**: In `AppContext.tsx`, if the user re-opens the app while offline or if token validation fails due to network outage, the user session is retrieved from `secureStorage.getItem("user")`, bypassing this login view automatically.

#### D. Data Bindings & Handlers (MUST NOT BE BROKEN)
- Form submission handler: `handleLogin(e: React.FormEvent)`.
- Input state setters: `setUsername(e.target.value)`, `setPassword(e.target.value)`.
- Eye toggle state setter: `setShowPassword(!showPassword)`.
- Authentication API call: `authApi.login({ username: username.trim(), password })`.
- Storage persistence:
  - `await secureStorage.setItem("accessToken", data.accessToken)`
  - `await secureStorage.setItem("refreshToken", data.refreshToken)` (if returned)
  - `await secureStorage.setItem("user", JSON.stringify(data.user))`
- Global context setters: `setUser(data.user)`.
- Role-based routing post-login:
  - If `data.user.role === "admin"`: `setSelectedVillageId("")`, `setActiveTab("villages")`.
  - If `data.user.role !== "admin"` (Officer): `setSelectedVillageId(data.user.village_id || "")`, `setActiveTab("households")`.

---

### 2.2 App.tsx & AppContext.tsx

#### A. DOM Structure & Router State Machine
```
App.tsx:
├── (if isInitializing === true)
│   └── div.min-h-screen.w-screen.bg-slate-50.dark:bg-slate-900.flex.flex-col.items-center.justify-center
│       ├── div.w-10.h-10.border-3.border-emerald-500/30.border-t-emerald-500.rounded-full.animate-spin.mb-4
│       └── div.text-sm.font-semibold.text-slate-600.dark:text-slate-300 ("Đang khởi tạo phiên làm việc...")
├── (if !user)
│   └── <LoginView />
└── (if user)
    └── <AppLayout>
        ├── activeTab === "villages"    -> <VillagesPage />
        ├── activeTab === "households"  -> <HouseholdsPage />
        ├── activeTab === "analytics"   -> <AnalyticsPage />
        ├── activeTab === "recycle-bin" -> <RecycleBinPage />
        ├── activeTab === "audit"       -> <AuditLogView />
        └── activeTab === "settings"    -> <SettingsPage />
```

#### B. Vietnamese Text & Content Invariants
- Splash Screen Loading Text: `Đang khởi tạo phiên làm việc Quản lý Nông nghiệp...`
- Default Village Scope for Admin: `Toàn xã Đăk Hà`
- Fallback Village Scope: `Chưa chọn thôn`

#### C. States & State Machine Variables
1. **Initializing Splash State**: Displayed during startup while checking `secureStorage.getItem("accessToken")` and invoking `authApi.getMe(token)`. `isInitializing` transitions from `true` to `false`.
2. **Unauthenticated State**: `user === null`. Renders `<LoginView />`.
3. **Authenticated State**: `user !== null`. Renders `<AppLayout>` containing the page designated by `activeTab`.
4. **Theme State**:
   - `theme`: `"light" | "dark"`.
   - Initialized from `localStorage.getItem("qlnn_theme")`, falling back to `window.matchMedia("(prefers-color-scheme: dark)")`.
   - Applies `.dark` class to `document.documentElement` dynamically.
5. **Zoom Level State**:
   - `zoomLevel`: number between `80` and `140` (percentage), stepped by `10`, default `100`.
   - Persisted in `localStorage.getItem("qlnn_zoom")`.
   - Dispatched to Electron window via `window.api?.app?.setZoom(zoomLevel)`.
   - Handled via hotkeys: `Ctrl +` / `Ctrl =` (Zoom In), `Ctrl -` / `Ctrl _` (Zoom Out), `Ctrl 0` (Reset 100%).
6. **Network & Server Latency State**:
   - `isOnline`: boolean, tracks window `"online"` and `"offline"` events.
   - `isBackendHealthy`: boolean, tracks health check response.
   - `latency`: number | null, computed via Exponential Moving Average (EMA, alpha = 0.3) on `/ping` or `/health` endpoint every 6,000ms.
   - Custom event `window.dispatchEvent(new CustomEvent("server:reconnected"))` dispatched on reconnection.
7. **Inactivity Auto-Logout State**:
   - Managed by `useInactivityTimeout(30 minutes)` when `user` is authenticated. Automatically triggers `logout()`.

#### D. Data Bindings & Handlers (MUST NOT BE BROKEN)
- Context methods:
  - `setUser`, `setActiveTab`, `setSelectedVillageId`, `setVillages`, `refreshVillages`
  - `toggleSidebar`, `setSidebarCollapsed`
  - `toggleTheme`
  - `zoomIn`, `zoomOut`, `resetZoom`
  - `logout()`: calls `authApi.logout(refreshToken)`, clears `secureStorage`, clears IndexedDB cache (`clearCache()`), sets `user = null`, clears `selectedVillageId`.
  - `checkServerHealth()`: axios ping probe with 3,000ms timeout.

---

### 2.3 AppLayout (`src/components/Layout/AppLayout.tsx`)

#### A. DOM Structure & Tree
```
div.flex.flex-col.h-screen.w-screen.overflow-hidden.bg-slate-100.dark:bg-slate-950.font-sans.transition-colors.duration-150
├── <Header />
├── <ConnectionBanner isOffline={isDisconnected} isReconnected={isReconnected} onRetry={handleRetry} isRetrying={isRetrying} />
└── div.flex.flex-1.overflow-hidden (Body Row)
    ├── <Sidebar />
    └── main.flex-1.overflow-y-auto.p-4.sm:p-6.bg-slate-100/70.dark:bg-slate-900/30 (Scrollable Viewport)
        └── div.w-full.max-w-none.space-y-6
            └── {children}
```

#### B. States & Handlers
1. **Disconnected State**: `isDisconnected = !isOnline || !isBackendHealthy`. Displays `<ConnectionBanner isOffline={true} />`.
2. **Reconnected Flash State**: Listens to `window.addEventListener("server:reconnected")`. Sets `isReconnected = true` for 3,500ms then auto-clears.
3. **Manual Retry State**: `isRetrying` toggles during `handleRetry()` which awaits `checkServerHealth()`.
4. **Viewport Layout**: Full viewport flex column (`h-screen w-screen overflow-hidden`). Main content area scrolls independently with padding `p-4 sm:p-6`.

---

### 2.4 Header (`src/components/Layout/Header.tsx`)

#### A. DOM Structure & Tree
```
header.h-16.bg-slate-900.border-b.border-slate-800.px-4.sm:px-6.flex.items-center.justify-between.shadow-xs.sticky.top-0.z-30.select-none
├── div.flex.items-center.gap-3 (Left: Brand Identity)
│   ├── div.w-9.h-9.rounded-xl.bg-emerald-500/10.border.border-emerald-500/20.text-emerald-400 (Sprout Icon)
│   └── div
│       ├── div.flex.items-center.gap-2
│       │   ├── h1.text-xs.sm:text-sm.font-black.text-white ("QUẢN LÝ NÔNG NGHIỆP")
│       │   └── span.px-2.py-0.5.text-[10px].font-bold.bg-emerald-950/80.text-emerald-300.rounded-full.border.border-emerald-800.hidden.sm:inline-block ("XÃ ĐĂK HÀ")
│       └── p.text-[11px].text-slate-400.font-medium.hidden.sm:block ("Dữ liệu Nông Nghiệp số Xã Đăk Hà")
└── div.flex.items-center.gap-2.sm:gap-3.5 (Right Controls)
    ├── div.hidden.md:flex.items-center.bg-slate-800.p-0.5.rounded-xl.border.border-slate-700 (Zoom Pill)
    │   ├── button (ZoomOut w-3.5 h-3.5, disabled={zoomLevel <= 80})
    │   ├── button (ResetZoom font-mono text-[11px]: "{zoomLevel}%")
    │   └── button (ZoomIn w-3.5 h-3.5, disabled={zoomLevel >= 140})
    ├── button.p-2.text-slate-300.hover:text-amber-400.bg-slate-800.rounded-xl.border.border-slate-700 (Theme Toggle: Sun / Moon)
    ├── div.hidden.md:flex.items-center.gap-1.5.px-3.py-1.5.bg-slate-800.rounded-xl.text-xs.font-bold (Village Indicator)
    │   ├── MapPin.w-3.5.h-3.5.text-emerald-400
    │   └── span.max-w-[150px].truncate ("{selectedVillageName}" | "Toàn xã Đăk Hà" | "Chưa chọn thôn")
    ├── button.flex.items-center.gap-1.5.px-2.5.py-1.5.rounded-xl.text-xs.font-bold (Ping / Network Indicator Button)
    │   ├── (Online/Healthy) -> span.w-2.h-2.rounded-full.bg-emerald-500 + Wifi.w-3.5.h-3.5 + span ("{latency}ms" | "Online")
    │   ├── (Offline) -> WifiOff.w-3.5.h-3.5.text-rose-400 + span ("Ngoại tuyến")
    │   └── (Connecting/Retrying) -> Activity.w-3.5.h-3.5.animate-spin.text-amber-400 + span ("Thử lại...")
    ├── div.h-5.w-px.bg-slate-700 (Separator Divider)
    ├── div.flex.items-center.gap-2.sm:gap-3 (User Profile & Role Badge)
    │   ├── div.w-8.h-8.rounded-full.bg-slate-800.border.border-slate-700 (Avatar 2-letter uppercase initials | UserIcon)
    │   └── div.text-left.hidden.lg:block
    │       ├── div.text-xs.font-black.text-slate-200 ("{user.username}" | "Cán bộ")
    │       └── div.flex.items-center.gap-1.text-[10px].text-slate-400
    │           ├── Shield.w-3.h-3.text-emerald-400
    │           └── span ("Cán bộ Xã (Admin)" | "Trưởng Thôn")
    └── button.p-2.text-slate-400.hover:text-rose-400.rounded-xl (Logout: LogOut.w-4.h-4)
```

#### B. Vietnamese Text & Content Invariants
- Application Title: `QUẢN LÝ NÔNG NGHIỆP`
- Location Pill Badge: `XÃ ĐĂK HÀ`
- Subtitle: `Dữ liệu Nông Nghiệp số Xã Đăk Hà`
- Zoom Out Tooltip / Aria: `Thu nhỏ giao diện (Ctrl -)`
- Reset Zoom Tooltip / Aria: `Đặt lại kích thước 100% (Ctrl 0)` / `Bấm để đặt lại kích thước 100% (Ctrl 0)`
- Zoom In Tooltip / Aria: `Phóng to giao diện (Ctrl +)`
- Theme Toggle Tooltip / Aria: `Chuyển sang giao diện Sáng` (when dark) / `Chuyển sang giao diện Tối` (when light)
- Network Pill Aria / Tooltip: `Xem chẩn đoán kết nối máy chủ` / `Bấm để xem chẩn đoán kết nối máy chủ`
- Network Status Labels:
  - Online: `Online` or `{latency}ms`
  - Offline: `Ngoại tuyến`
  - Reconnecting: `Thử lại...`
- Village Indicator Fallbacks: `Toàn xã Đăk Hà` / `Chưa chọn thôn`
- Default User Name: `Cán bộ`
- Role Badge Labels:
  - Admin: `Cán bộ Xã (Admin)`
  - Officer: `Trưởng Thôn`
- Logout Button Tooltip / Aria: `Đăng xuất khỏi hệ thống`

#### C. States & Edge Cases
1. **Zoom Limits**:
   - `zoomLevel <= 80`: ZoomOut button disabled (`disabled:opacity-40 disabled:cursor-not-allowed`).
   - `zoomLevel >= 140`: ZoomIn button disabled (`disabled:opacity-40 disabled:cursor-not-allowed`).
2. **Network Health Micro-States**:
   - *State 1 (Optimal)*: `isOnline && isBackendHealthy`. Emerald styling (`bg-emerald-950/60 text-emerald-300 border-emerald-800`), green pulsing dot, Wifi icon, displays formatted EMA latency (e.g. `24ms`).
   - *State 2 (Offline)*: `!isOnline`. Rose styling (`bg-rose-950/60 text-rose-300 border-rose-800`), WifiOff icon, displays `"Ngoại tuyến"`.
   - *State 3 (Server Unreachable / Retrying)*: `isOnline && !isBackendHealthy`. Amber styling (`bg-amber-950/60 text-amber-300 border-amber-800`), spinning Activity icon, displays `"Thử lại..."`.
3. **Modal Dialog Integration**: Clicking the Network / Ping pill opens `<ServerStatusModal>` (`showStatusModal === true`).
4. **Responsive Collapsing (360px Viewport)**:
   - Left brand: Subtitle hidden (`hidden sm:block`), "XÃ ĐĂK HÀ" badge hidden (`hidden sm:inline-block`), Title stays `text-xs`.
   - Right controls: Zoom pill hidden (`hidden md:flex`), Village badge hidden (`hidden md:flex`), User name and role hidden (`hidden lg:block`), Ping text hidden (`hidden sm:inline`).
   - Only essential interactive elements remain visible: Theme button, Network status icon, User avatar, and Logout button.
5. **Long Village Names / Usernames**: Handled safely with `max-w-[150px] truncate` and `leading-snug whitespace-nowrap`.

#### D. Data Bindings & Handlers
- `zoomOut()`, `resetZoom()`, `zoomIn()`.
- `toggleTheme()`.
- `setShowStatusModal(true)`.
- `logout()`.

---

### 2.5 Sidebar (`src/components/Layout/Sidebar.tsx`)

#### A. DOM Structure & Tree
```
aside.bg-slate-950.text-slate-300.flex.flex-col.shrink-0.border-r.border-slate-800/80.transition-[width].duration-200.ease-out.overflow-hidden
(Dynamic width: isSidebarCollapsed ? "w-16" : "w-16 md:w-64")
├── div.p-3.flex.items-center.justify-between.border-b.border-slate-900.min-h-[56px] (Header / Toggle Bar)
│   ├── (!isSidebarCollapsed)
│   │   ├── div.hidden.md:flex.text-xs.font-black.text-slate-400.uppercase.tracking-widest (Database icon + "DANH MỤC")
│   │   ├── button.hidden.md:flex (PanelLeftClose icon, aria-label="Thu gọn thanh bên")
│   │   └── button.md:hidden (Database icon, aria-label="Mở rộng hoặc thu gọn thanh bên")
│   └── (isSidebarCollapsed)
│       └── button.w-full.flex.items-center.justify-center (PanelLeftOpen icon, aria-label="Mở rộng thanh bên")
├── div.p-2.5.flex-1.overflow-y-auto.overflow-x-hidden (Navigation List)
│   └── nav.flex.flex-col.gap-2
│       └── (mapped navItems)
│           └── div.relative.group.flex.justify-center.w-full
│               ├── button[type="button"].flex.items-center.gap-3.rounded-2xl.transition-all (Nav Button)
│               │   ├── Icon.w-5.h-5.shrink-0
│               │   └── div.hidden.md:flex.max-w-[180px].flex-1.flex-col.justify-center (!isSidebarCollapsed)
│               │       ├── div.flex.items-center.justify-between
│               │       │   ├── span.text-[13.5px].font-bold ("{item.label}")
│               │       │   └── span.text-[10px].font-bold.px-1.5.py-0.5.rounded-md ("{item.badge}")
│               │       └── div.text-xs.truncate.mt-0.5 ("{item.desc}")
│               └── (if isSidebarCollapsed)
│                   └── div.absolute.left-full.top-1/2.-translate-y-1/2.ml-3.z-50.px-3.5.py-2.bg-slate-900.rounded-2xl.shadow-2xl.border.border-slate-700/90.pointer-events-none.opacity-0.invisible.group-hover:opacity-100.group-hover:visible (Hover Tooltip)
│                       ├── span.text-sm ("{item.label}")
│                       └── div.text-xs.text-slate-400 ("{item.desc}")
└── div.p-3.5.border-t.border-slate-900.bg-slate-950.text-xs.text-slate-400 (Bottom Version Card)
    ├── (!isSidebarCollapsed)
    │   ├── div.hidden.md:block.space-y-1 (ShieldCheck icon + "QLNN v1.0.0")
    │   └── div.md:hidden.flex.justify-center (ShieldCheck icon)
    └── (isSidebarCollapsed)
        └── div.flex.justify-center (ShieldCheck icon)
```

#### B. Contextual Navigation Matrix & Business Rules (VERIFIED BY TEST SUITE)

##### 1. Role: Admin (`user?.role === "admin"`)
* **State 1A: No Village Selected (`selectedVillageId === ""`), tab !== "analytics"**:
  - Exact 4 Navigation Items:
    1. `villages` | Label: `Quản Lý Thôn` | Icon: `MapIcon` | Desc: `Quản lý các thôn xã Đăk Hà`
    2. `recycle-bin` | Label: `Thùng Rác` | Icon: `Trash2` | Desc: `Quản lý hộ dân đã xóa`
    3. `audit` | Label: `Nhật Ký Hoạt Động` | Icon: `History` | Desc: `Lịch sử biến động dữ liệu`
    4. `settings` | Label: `Cài Đặt Hệ Thống` | Icon: `SettingsIcon` | Desc: `Tài khoản & sao lưu CSDL`
  - *Strict Rule*: Do NOT render Thống Kê, Hộ Nông Nghiệp, or Nhập/Xuất Excel in this state.
* **State 1B: No Village Selected (`selectedVillageId === ""`), tab === "analytics" (Overview)**:
  - Exact 5 Navigation Items:
    1. `villages` | Label: `Quản Lý Thôn` | Icon: `MapIcon` | Desc: `Quản lý các thôn xã Đăk Hà`
    2. `analytics` | Label: `Thống Kê` | Icon: `BarChart3` | Desc: `Toàn xã Đăk Hà` | Badge: `Chính`
    3. `recycle-bin` | Label: `Thùng Rác` | Icon: `Trash2` | Desc: `Quản lý hộ dân đã xóa`
    4. `audit` | Label: `Nhật Ký Hoạt Động` | Icon: `History` | Desc: `Lịch sử biến động dữ liệu`
    5. `settings` | Label: `Cài Đặt Hệ Thống` | Icon: `SettingsIcon` | Desc: `Tài khoản & sao lưu CSDL`
* **State 1C: Specific Village Selected (`selectedVillageId !== ""` e.g. "v1")**:
  - Exact 6 Navigation Items (ordered with `analytics` preceding `households`):
    1. `villages` | Label: `Quản Lý Thôn` | Icon: `MapIcon` | Desc: `Quay lại danh sách thôn`
    2. `analytics` | Label: `Thống Kê` | Icon: `BarChart3` | Desc: `{selectedVillageName}` | Badge: `Chính`
    3. `households` | Label: `Hộ Nông Nghiệp` | Icon: `Sprout` | Desc: `{selectedVillageName}`
    4. `recycle-bin` | Label: `Thùng Rác` | Icon: `Trash2` | Desc: `Quản lý hộ dân đã xóa`
    5. `audit` | Label: `Nhật Ký Hoạt Động` | Icon: `History` | Desc: `Lịch sử biến động dữ liệu`
    6. `settings` | Label: `Cài Đặt Hệ Thống` | Icon: `SettingsIcon` | Desc: `Tài khoản & sao lưu CSDL`

##### 2. Role: Officer (`user?.role !== "admin"`, Village-Scoped)
* Exact 4 Navigation Items (ordered with `analytics` first with badge `Chính`):
  1. `analytics` | Label: `Thống Kê` | Icon: `BarChart3` | Desc: `18 chỉ tiêu nông nghiệp` | Badge: `Chính`
  2. `households` | Label: `Hộ Nông Nghiệp` | Icon: `Sprout` | Desc: `Quản lý 18 chỉ số hộ dân`
  3. `recycle-bin` | Label: `Thùng Rác` | Icon: `Trash2` | Desc: `Quản lý hộ dân đã xóa`
  4. `audit` | Label: `Nhật Ký Hoạt Động` | Icon: `History` | Desc: `Lịch sử biến động dữ liệu`
* *Strict Rule*: Officers never see `villages` (Quản Lý Thôn) or `settings` (Cài Đặt Hệ Thống).

#### C. Vietnamese Text & Content Invariants
- Section Header: `DANH MỤC`
- Collapse Tooltip / Aria: `Thu gọn thanh bên`
- Expand Tooltip / Aria: `Mở rộng thanh bên`
- Mobile Toggle Tooltip / Aria: `Mở rộng hoặc thu gọn thanh bên`
- Menu Item Labels:
  - `Quản Lý Thôn`
  - `Thống Kê`
  - `Hộ Nông Nghiệp`
  - `Thùng Rác`
  - `Nhật Ký Hoạt Động`
  - `Cài Đặt Hệ Thống`
- Menu Item Descriptions:
  - `Quản lý các thôn xã Đăk Hà`
  - `Quay lại danh sách thôn`
  - `Toàn xã Đăk Hà`
  - `18 chỉ tiêu nông nghiệp`
  - `Quản lý 18 chỉ số hộ dân`
  - `Quản lý hộ dân đã xóa`
  - `Lịch sử biến động dữ liệu`
  - `Tài khoản & sao lưu CSDL`
  - `{selectedVillageName}` (dynamic village name)
- Badge Label: `Chính`
- Version Card: `QLNN v1.0.0`

#### D. States & Handlers
1. **Collapsed Rail State (`w-16`)**:
   - Text label and description hidden (`hidden`).
   - Button centered: `w-12 h-12 justify-center mx-auto`.
   - Tooltip hover micro-state: displays floating card `absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50` with item label and description.
2. **Expanded Drawer State (`w-64` on desktop)**:
   - Full label, badge pill, and truncated description visible.
3. **Active Pill Micro-State**:
   - `activeTab === item.id`: `bg-emerald-600 text-white shadow-md shadow-emerald-950/30`.
   - Inactive: `text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50`.
4. **Click Handlers**:
   - Clicking `"villages"`: resets selected village `setSelectedVillageId("")`, sets `setActiveTab("villages")`.
   - Clicking any other item: sets `setActiveTab(item.id)`.

---

### 2.6 ConnectionBanner (`src/components/network/ConnectionBanner.tsx`)

#### A. DOM Structure & Tree
```
ConnectionBanner:
├── (if isReconnected === true)
│   └── div.bg-emerald-600.text-white.px-4.py-2.text-xs.font-bold.flex.items-center.justify-center.gap-2.shadow-xs.animate-in.slide-in-from-top.duration-300
│       ├── CheckCircle2.w-4.h-4
│       └── span ("Đã khôi phục kết nối thành công — Dữ liệu đã được đồng bộ tự động thời gian thực!")
├── (if isOffline === true)
│   └── div.bg-gradient-to-r.from-amber-600.via-rose-600.to-rose-700.text-white.px-4.py-2.text-xs.font-semibold.flex.items-center.justify-between.shadow-md.animate-in.slide-in-from-top.duration-300
│       ├── div.flex.items-center.gap-2
│       │   ├── AlertTriangle.w-4.h-4.text-amber-200.animate-pulse
│       │   └── span
│       │       ├── strong ("Mất kết nối đến máy chủ Đăk Hà:")
│       │       └── text (" Ứng dụng đang chuyển sang chế độ đọc bộ nhớ đệm và tự động kết nối lại...")
│       └── button.flex.items-center.gap-1.5.px-3.py-1.bg-white/20.hover:bg-white/30.rounded-2xl.text-xs.font-bold (onClick={onRetry}, disabled={isRetrying})
│           ├── RefreshCw.w-3.5.h-3.5 (conditional animate-spin)
│           └── span ("{isRetrying ? 'Đang thử lại...' : 'Thử kết nối ngay'}")
└── (default)
    └── null
```

#### B. Vietnamese Text & Content Invariants
- Reconnected Banner Text: `Đã khôi phục kết nối thành công — Dữ liệu đã được đồng bộ tự động thời gian thực!`
- Offline Banner Title: `Mất kết nối đến máy chủ Đăk Hà:`
- Offline Banner Description: `Ứng dụng đang chuyển sang chế độ đọc bộ nhớ đệm và tự động kết nối lại...`
- Retry Button Default Label: `Thử kết nối ngay`
- Retry Button Loading Label: `Đang thử lại...`
- Retry Button Aria: `Đang thử lại kết nối` / `Thử kết nối lại máy chủ ngay`

#### C. States & Edge Cases
1. **Hidden / Healthy State**: Returns `null` when connected and not in recovery window.
2. **Offline Warning State**: Red-orange gradient bar (`from-amber-600 via-rose-600 to-rose-700`), pulsing warning icon, sticky below header.
3. **Retrying State**: `isRetrying === true`, button disabled, `RefreshCw` icon animates with `animate-spin`, label changes to `"Đang thử lại..."`.
4. **Reconnected Success State**: Solid emerald bar (`bg-emerald-600`), displays for 3,500ms before auto-dismissing.
5. **Mobile 360px Viewport**: Text wraps gracefully; retry button has `shrink-0` to prevent squishing or clipping.

---

### 2.7 ServerStatusModal (`src/components/network/ServerStatusModal.tsx`)

#### A. DOM Structure & Tree
```
div.fixed.inset-0.z-50.flex.items-center.justify-center.p-4.bg-slate-900/50.backdrop-blur-sm.animate-in.fade-in
└── div[ref=modalRef][role="dialog"][aria-modal="true"][aria-labelledby="server-status-title"].bg-white.dark:bg-slate-900.w-full.max-w-sm.rounded-3xl.shadow-2xl.border.border-slate-200.dark:border-slate-800.overflow-hidden
    ├── div.p-4.border-b.border-slate-100.dark:border-slate-800.flex.justify-between.items-center (Header)
    │   ├── div.flex.items-center.gap-2.font-bold
    │   │   ├── Server.w-5.h-5.text-slate-500
    │   │   └── span#server-status-title ("Trạng Thái Máy Chủ")
    │   └── button.p-1.5.text-slate-400.hover:text-slate-600.rounded-xl (X.w-5.h-5, aria-label="Đóng hộp thoại...")
    └── div.p-6.space-y-6 (Body Cards)
        ├── div.flex.items-center.justify-between.p-4.bg-slate-50.dark:bg-slate-800/50.rounded-2xl.border (Connection Health Card)
        │   └── div.flex.items-center.gap-3
        │       ├── div.w-10.h-10.rounded-full.flex.items-center.justify-center (CheckCircle2 / AlertCircle)
        │       └── div
        │           ├── div.font-bold.text-sm ("Kết Nối")
        │           └── div.text-xs.text-slate-500 ("{isBackendHealthy ? 'Hoạt động ổn định' : 'Mất kết nối'}")
        └── div.flex.items-center.justify-between.p-4.bg-slate-50.dark:bg-slate-800/50.rounded-2xl.border (Latency Ping Card)
            └── div.flex.items-center.gap-3
                ├── div.w-10.h-10.rounded-full.flex.items-center.justify-center.bg-blue-100.text-blue-600 (Activity icon)
                └── div
                    ├── div.font-bold.text-sm ("Độ Trễ (Ping)")
                    └── div.text-xs.text-slate-500 ("{latency !== null ? latency + ' ms' : 'Đang đo...'}")
```

#### B. Vietnamese Text & Content Invariants
- Modal Header Title: `Trạng Thái Máy Chủ`
- Close Button Aria: `Đóng hộp thoại trạng thái máy chủ`
- Health Card Title: `Kết Nối`
- Healthy Status Text: `Hoạt động ổn định`
- Unhealthy Status Text: `Mất kết nối`
- Latency Card Title: `Độ Trễ (Ping)`
- Latency Measuring Text: `Đang đo...`
- Latency Formatted Value: `{latency} ms`

#### C. States & Accessibility
1. **Closed State**: `isOpen === false` -> returns `null`.
2. **Open / Focus Trapped State**: Auto-focuses close button on mount. Pressing `Escape` triggers `onClose()`. Pressing `Tab` / `Shift+Tab` cycles strictly through focusable elements. Clicking backdrop triggers `onClose()`.
3. **Backend Healthy State**: Connection badge displays emerald circle with `CheckCircle2` icon and `"Hoạt động ổn định"`.
4. **Backend Unhealthy State**: Connection badge displays rose circle with `AlertCircle` icon and `"Mất kết nối"`.
5. **Ping State**: Shows smoothed EMA latency value (`ms`) or `"Đang đo..."` while probing.

---

### 2.8 ErrorBoundary (`src/components/common/ErrorBoundary.tsx`)

#### A. DOM Structure & Tree
```
div.flex.flex-col.items-center.justify-center.min-h-screen.p-6.text-center.bg-slate-50.font-sans
├── div.p-4.bg-rose-100.text-rose-600.rounded-full.mb-4
│   └── AlertTriangle.w-10.h-10
├── h1.text-2xl.font-bold.text-slate-800.mb-2 ("Đã xảy ra sự cố hệ thống")
├── p.text-slate-600.mb-6.max-w-md ("Giao diện ứng dụng gặp lỗi không mong muốn. Vui lòng thử tải lại hoặc liên hệ quản trị viên.")
├── pre.bg-white.dark:bg-slate-900.border.border-slate-200.dark:border-slate-800.rounded-xl.p-4.max-w-xl.w-full.overflow-auto.text-left.text-xs.font-mono.text-slate-700.dark:text-slate-300.mb-6.shadow-xs
│   └── "{error.message}\n\n{error.stack}"
└── button.flex.items-center.gap-2.px-5.py-2.5.bg-emerald-600.hover:bg-emerald-700.text-white.font-medium.rounded-lg.shadow-sm (onClick={() => window.location.reload()})
    ├── RefreshCw.w-4.h-4
    └── span ("Tải lại ứng dụng")
```

#### B. Vietnamese Text & Content Invariants
- Error Title: `Đã xảy ra sự cố hệ thống`
- Error Description: `Giao diện ứng dụng gặp lỗi không mong muốn. Vui lòng thử tải lại hoặc liên hệ quản trị viên.`
- Action Button Label: `Tải lại ứng dụng`

#### C. States & Edge Cases
1. **Normal / Pass-through State**: `hasError === false` -> renders `this.props.children`.
2. **Error State**: Caught by `componentDidCatch(error, errorInfo)`. Displays error viewport with stack trace.
3. **Custom Fallback State**: If `fallback` prop provided, renders custom fallback node.
4. **Reload Action**: Button triggers `window.location.reload()`.

---

## 3. COMPARISON & FORM MODERNIZATION PROPOSALS (QLHK vs QLNN)

| Component Area | Reference App Pattern (QLHK FORM) | Target App Current (QLNN) | Proposed Enhancement | Content Impact |
|:---------------|:---------------------------------|:--------------------------|:---------------------|:--------------:|
| **Sidebar on Mobile (< 768px)** | Slide-over drawer with backdrop blur overlay `fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden` and auto-close on selection | Remains in flow as `w-16` narrow rail on mobile | Adopt QLHK mobile drawer overlay for cleaner mobile UX | **None** (100% QLNN menus & labels preserved) |
| **Sidebar Border Radius** | `rounded-2xl` menu buttons, `rounded-2xl` floating tooltips | `rounded-2xl` menu buttons | Fully aligned | **None** |
| **Login Card Surface** | `rounded-2xl p-8 shadow-xl border-t-4 border-t-emerald-600` | `rounded-2xl p-6 sm:p-8 shadow-xl border-t-4 border-t-emerald-600` | Fully aligned | **None** |
| **Theme Toggle Icon** | `Sun` (amber-400 in dark) / `Moon` (slate-300 in light) | Same Lucide Sun / Moon | Fully aligned | **None** |
| **ErrorBoundary Dark Mode** | Dark mode compatible container | Outer container has hardcoded `bg-slate-50` | Add `dark:bg-slate-950 text-slate-900 dark:text-slate-100` and `rounded-xl` to button | **None** |
| **Header Zoom Controls** | Zoom pill `hidden sm:flex` in QLHK | `hidden md:flex` in QLNN | Keep `hidden md:flex` to guarantee zero header overflow | **None** |
| **Network Latency Formula** | Smooth EMA (alpha = 0.3) with `/ping` and `/health` fallback | Identical EMA algorithm | Fully aligned | **None** |

---

## 4. VERIFICATION CHECKLIST & CRITICAL INVARIANTS

- [x] **Zero Vietnamese string alteration**: All titles, subtitles, placeholders, labels, alert messages, and tooltips documented verbatim.
- [x] **Contextual navigation logic preserved**:
  - Admin (no village): 4 tabs (`villages`, `recycle-bin`, `audit`, `settings`).
  - Admin (analytics overview): 5 tabs (`villages`, `analytics` [Chính], `recycle-bin`, `audit`, `settings`).
  - Admin (village selected): 6 tabs (`villages`, `analytics` [Chính], `households`, `recycle-bin`, `audit`, `settings`).
  - Officer: 4 tabs (`analytics` [Chính], `households`, `recycle-bin`, `audit`).
- [x] **All interactive micro-states covered**: Hover tooltips, focus rings, disabled states, zoom boundaries (80%-140%), ping latency color codes, offline banner degradation, and modal focus trap.
- [x] **No ad-hoc temp files created**: Output directly authored to designated artifact file `ui-sync/00_screens_shell.md`.
