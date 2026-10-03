# RUNTIME & TESTING GUIDE: QLHK vs QLNN

This document records the exact configuration, ports, commands, and credentials to run, preview, and test both applications.

---

## 1. REFERENCE APP: QLHK (Quản Lý Hộ Khẩu)

- **Physical Directory**: `C:\Users\umnuar\Documents\Projects\QLHK`
- **Role**: Source of visual design language, tokens, and UX patterns (**READ ONLY**).

### Frontend: QLHK-Client
- **Path**: `C:\Users\umnuar\Documents\Projects\QLHK\QLHK-Client`
- **Dev Port**: `http://localhost:5175` (Strict port: 5175, host: true)
- **Vite Proxy**: `/api` -> `http://localhost:5002`
- **Dev Command**:
  ```powershell
  cd C:\Users\umnuar\Documents\Projects\QLHK\QLHK-Client
  npm run dev
  ```
- **Build / Preview Command**:
  ```powershell
  npm run build:vite
  npm run preview -- --port 5175
  ```
- **Test Command**:
  ```powershell
  npm test
  # 15 test suites, 131 tests
  ```

### Backend: QLHK-Backend
- **Path**: `C:\Users\umnuar\Documents\Projects\QLHK\QLHK-Backend`
- **Port**: `5002`
- **Dev Command**:
  ```powershell
  cd C:\Users\umnuar\Documents\Projects\QLHK\QLHK-Backend
  npm run dev
  ```
- **Database & Seed**:
  ```powershell
  npx prisma db push
  npm run seed
  ```
- **Default Accounts**:
  - Quản trị viên (Admin): `admin` / `password123`
  - Cán bộ thôn: `canboxa` / `password123`

---

## 2. TARGET APP: QLNN (Quản Lý Nông Nghiệp)

- **Physical Directory**: `C:\Users\umnuar\Documents\Projects\QLNN`
- **Role**: Target for complete UI overhaul. 100% of data, columns, logic, and Vietnamese text preserved (**READ-WRITE on branch `ui/full-sync`**).

### Frontend: QLNN-Client
- **Path**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client`
- **Dev Port**: `http://localhost:5174`
- **Vite Proxy**: `/api` -> `http://localhost:5001`
- **Dev Command**:
  ```powershell
  cd C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client
  npm run dev
  ```
- **Build / Preview Command**:
  ```powershell
  npm run build:vite
  npm run preview -- --port 5174
  ```
- **Test Command**:
  ```powershell
  npm test
  # 7 test suites, 26 tests
  ```

### Backend: QLNN-Backend
- **Path**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Backend`
- **Port**: `5001`
- **Dev Command**:
  ```powershell
  cd C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Backend
  npm run dev
  ```
- **Test Command**:
  ```powershell
  npm test
  # 5 test suites, 29 tests
  ```
- **Database & Seed**:
  ```powershell
  npm run seed
  ```
- **Default Accounts**:
  - Quản trị viên (Admin): `admin` / `123456`
  - Cán bộ thôn: `user_thon1` / `123456`

---

## 3. VERIFICATION PROTOCOL (QUALITY GATES)

Before and after every change:
1. **Frontend Tests**:
   ```powershell
   npm test
   ```
   Must pass 100% (26/26 tests).
2. **Frontend Type Check & Build**:
   ```powershell
   npm run build:vite
   ```
   Must compile with 0 TypeScript and 0 Vite bundling errors.
3. **Backend Tests**:
   ```powershell
   npm test
   ```
   Must pass 100% (29/29 tests).
4. **No loose temp files**:
   Never create `fix*`, `patch*`, `temp*` scripts. All reports strictly saved in `ui-sync/`.
