# EduNexus ERP Codebase Context Memo

> **Last updated:** 26 May 2026 — after RBAC + role-scoping implementation sweep

## 1. Executive Summary

EduNexus ERP is a **demo-only** React + TypeScript single-page application for school operations (students, teachers, attendance, fees, exams, payroll, timetable, library, hostel, transport, analytics, notifications, settings).

**Runtime mode:** Demo-only — all data served from local mock files under `src/data/`. Supabase integration was removed from the UI and auth flow; the Supabase client and service layer files remain in the codebase but are disconnected from the active page layer.

The application now has **full Role-Based Access Control (RBAC)** at three levels:
- **Route level** — unauthorized roles are redirected with a toast
- **Sidebar level** — nav items filtered per role
- **Data/scoping level** — every page uses `useRoleScope()` to show only role-relevant records and hide admin controls

## 2. Current File Count

- ~65 files under `src/` (up from 59 after adding `config/permissions.ts`, `hooks/usePermissions.ts`, `hooks/useRoleScope.ts`)
- 4 SQL migrations remain in `supabase/migrations/` (unused at runtime, kept for reference)
- Build: `npm run build` succeeds, ~906 kB JS (≈253 kB gzipped)

## 3. Tech Stack

### 3.1 Frontend
- React 18 + TypeScript (strict)
- Vite 5
- React Router DOM 6
- Zustand (with `persist` middleware)
- Tailwind CSS + custom CSS variables for theming
- Framer Motion (page transitions)
- Recharts (dashboard charts)
- Sonner (toast notifications)
- Lucide React (icons)

### 3.2 Data Layer (Demo-only)
- Mock data: `src/data/students.ts`, `teachers.ts`, `fees.ts`, `analytics.ts`
- Service layer: `src/services/*.ts` — exists with Supabase checks but **not wired** to pages
- Hooks: `src/hooks/useStudents.ts`, `useTeachers.ts`, `useFees.ts`, `useRealtime.ts` — async wrappers, **not wired** to pages
- **Active hooks:** `usePermissions.ts` (route/sidebar/widget RBAC), `useRoleScope.ts` (data scoping + UI flags)

### 3.3 Build & Tooling
- Scripts: `dev`, `build`, `preview`
- No lint/test scripts in `package.json` (ESLint config exists but unused)
- `tsconfig.json` (ES2020, strict) and `tsconfig.app.json` (ES2023, stricter lint) — not fully aligned
- Bundle: ~906 kB, no code-splitting yet

## 4. High-Level Architecture

```text
main.tsx
  -> BrowserRouter
  -> App.tsx route switch
     -> ProtectedRoute (checks isAuthenticated + role permission)
        -> On unauthorized: redirect to /dashboard + toast
     -> AppLayout (Sidebar + Topbar + page content)
        -> module pages (each uses useRoleScope for data filtering)

Permissions config (src/config/permissions.ts):
  -> routePermissions    — which roles can access each route
  -> navPermissions      — which sidebar items each role sees
  -> dashboardWidgetPermissions — which KPI/chart widgets render

Hooks layer:
  -> usePermissions()    — canAccessRoute, canSeeWidget, canSeeNavItem
  -> useRoleScope()      — scopedStudents, scopedFees, canManage*, canMark*, etc.
```

### 4.1 App Shell & Navigation

- `src/App.tsx` — all routes defined with `ProtectedRoute` wrapper that accepts a `routeId` and checks `routePermissions[routeId]` against `user.role`
- `src/layouts/AppLayout.tsx` — Sidebar + Topbar + animated page container
- `src/components/layout/Sidebar.tsx` — nav items filtered via `usePermissions().getVisibleNavItems()`
- `src/components/layout/Topbar.tsx` — dark mode toggle, notification bell, logout menu, UI-only search bar

### 4.2 State Management (`src/store/useAppStore.ts`)

State:
- `user: User | null`, `isAuthenticated: boolean`
- `isDarkMode: boolean`, `sidebarCollapsed: boolean`, `sidebarOpen: boolean`
- `notifications: Notification[]`, `unreadCount: number`

Actions:
- `loginDemo(role)` — sets user from predefined demo users map (9 roles)
- `logout()` — clears user state
- `toggleDarkMode()`, `toggleSidebar()`, `setSidebarOpen()`
- `markNotificationRead()`, `markAllRead()`, `addNotification()`

Persisted state (localStorage): `isDarkMode`, `sidebarCollapsed`

**Removed** (previous session): `loginWithSupabase`, `initAuth`, `isLoadingAuth`, all Supabase auth imports

## 5. Authentication & RBAC

### 5.1 Login

- `src/pages/LoginPage.tsx` — **Demo-only role selection** (6 role cards: Super Admin, School Admin, Teacher, Student, Parent, Accountant). No Supabase tab, no email/password form, no mode switcher.
- Clicking a role card + "Enter as {role}" button calls `loginDemo(role)` → store sets `user` + `isAuthenticated` → navigates to `/dashboard`

### 5.2 RBAC Architecture

Three-layer permission system:

| Layer | File | Mechanism |
|-------|------|-----------|
| **Route** | `src/App.tsx` | `ProtectedRoute` checks `routePermissions[routeId]` vs `user.role`. Unauthorized → redirect to `/dashboard` + error toast |
| **Sidebar** | `src/components/layout/Sidebar.tsx` | `usePermissions().getVisibleNavItems()` filters the 14 nav items per role |
| **Data/UI** | `src/hooks/useRoleScope.ts` | Returns scoped data arrays, visibility booleans (`canManageStudents`, `showFeeCharts`, etc.) consumed by every page |

### 5.3 Permission Config (`src/config/permissions.ts`)

Centralized source of truth:

- `routePermissions` — Record of `RouteId → UserRole[] | '*'`
- `navPermissions` — Array of `{ routeId, label, roles }`
- `dashboardWidgetPermissions` — Record of `WidgetId → UserRole[] | '*'`
- `hasPermission(role, allowed)` — helper function

### 5.4 Role Access Matrix

| Role | Dashboard | Students | Teachers | Attendance | Fees | Exams | Payroll | Timetable | Library | Hostel | Transport | Analytics | Notif. | Settings |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **School Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Teacher** | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Student** | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Parent** | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Accountant** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **HR** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Librarian** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Transport Mgr** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |

## 6. Page-by-Page Functional Context (Updated)

### 6.1 Dashboard (`src/dashboard/DashboardPage.tsx`)
- **RBAC:** Widgets filtered via `usePermissions().canSeeWidget()`. 8 KPIs, 4 charts, 3 data cards conditionally rendered
- **Data scoping:** Recent Students & Pending Fees sections use `useRoleScope()` scoped arrays
- Title adapts per role (e.g., "My Profile" for student)

### 6.2 Login (`src/pages/LoginPage.tsx`)
- Demo-only role selection grid (6 cards)
- Left branding panel with animated floating stat cards
- "Enter as {role}" button with loading state

### 6.3 Students (`src/pages/StudentsPage.tsx`)
- **Access:** Admin + Teacher only (Student/Parent get access-limited message)
- **Data scope:** Teacher sees Class 10 students only; Admin sees all
- **UI:** Checkboxes, bulk actions, Add/Edit/Delete buttons hidden for non-admin
- Title adapts: "Student Management" vs "My Students"

### 6.4 Teachers (`src/pages/TeachersPage.tsx`)
- **Access:** Admin only (Super Admin + School Admin)
- Card-based listing with search + department filter
- View/Edit actions visible only to admins

### 6.5 Attendance (`src/pages/AttendancePage.tsx`)
- **Access:** Admin, Teacher, Student, Parent
- **Data scope:** Student/Parent sees only own/child record; Teacher sees class 10
- **Controls:** Mark Present/Absent/Late buttons hidden for Student/Parent (view-only)
- Student/Parent sees attendance % badge instead of marking buttons

### 6.6 Fees (`src/pages/FeesPage.tsx`)
- **Access:** Admin, Accountant, Student, Parent
- **Data scope:** Student/Parent sees only own/child fees
- **Charts:** Revenue + Fee Collection charts hidden for non-finance roles
- **Actions:** Add/Export hidden for Student/Parent

### 6.7 Exams (`src/pages/ExamsPage.tsx`)
- **Access:** Admin, Teacher, Student, Parent
- **Data scope:** Schedule tab hidden for Student/Parent (results + analytics only)
- Schedule/Export actions hidden for Student/Parent

### 6.8 Payroll (`src/pages/PayrollPage.tsx`)
- **Access:** Admin, Accountant, HR
- **Status:** Fixed (no longer randomized per render)
- **Actions:** Run Payroll restricted to Admin; HR/Accountant get Export Report only
- Title adapts per role

### 6.9 Timetable (`src/pages/TimetablePage.tsx`)
- **Access:** Admin, Teacher, Student, Parent
- **Default class:** Set per role via `useRoleScope().timetableDefaultClass`
- **Controls:** Teacher/Class view toggle + Edit Schedule hidden for non-admin
- Class dropdown visible to all (shows role-appropriate default)

### 6.10 Library (`src/pages/LibraryPage.tsx`)
- **Access:** Admin, Librarian, Teacher, Student
- **Tabs:** "Members" tab hidden for Student/Parent/Teacher
- Add Book/Export hidden for non-librarian/non-admin

### 6.11 Hostel (`src/pages/HostelPage.tsx`)
- **Access:** Admin only
- No changes needed — route protection handles access

### 6.12 Transport (`src/pages/TransportPage.tsx`)
- **Access:** Admin + Transport Manager
- No changes needed — route protection handles access

### 6.13 Analytics (`src/pages/AnalyticsPage.tsx`)
- **Access:** Admin only
- Aggregated chart page with subject performance data

### 6.14 Notifications (`src/pages/NotificationsPage.tsx`)
- **Access:** All roles
- Renders notifications from Zustand store
- Mark read/all read actions

### 6.15 Settings (`src/pages/SettingsPage.tsx`)
- **Access:** All roles
- Profile card, dark mode toggle, presentational settings

## 7. Reusable Component Layer

### 7.1 Layout + Shared
- `PageHeader` — breadcrumbs, title, description, optional action buttons
- `KPICard` — animated gradient stat cards
- `StatBadge` — compact stat token

### 7.2 UI Primitives
- `Button` (8 variants), `Card` (compound), `Badge` (5 variants), `Avatar` (gradient initials)
- `Input`, `Select` helpers
- `EmptyState` — accepts `icon` (ReactNode) or `iconComponent` (component type)
- `Skeleton` loading placeholders

### 7.3 Charts
- `RevenueChart`, `AttendanceChart`, `GradeDistributionChart`, `FeeCollectionChart`
- All consume `src/data/analytics.ts`

## 8. Data, Services & Hooks

### 8.1 Mock Data Layer
- `src/data/students.ts` — 12 student records
- `src/data/teachers.ts` — teacher records
- `src/data/fees.ts` — fee records with payment status
- `src/data/analytics.ts` — revenue, attendance, grade distribution, fee collection data

### 8.2 Service Layer (disconnected, kept for reference)
- `authService`, `studentService`, `teacherService`, `attendanceService`, `feeService`, `notificationService`
- All check `isSupabaseConfigured` and fall back gracefully
- **Not wired** to any page — pages use mock data directly

### 8.3 Hooks Layer
| Hook | Status | Purpose |
|------|--------|---------|
| `usePermissions` | ✅ Active | Route/sidebar/widget RBAC checks |
| `useRoleScope` | ✅ Active | Scoped mock data + UI visibility flags |
| `useStudents` | ⏸️ Disconnected | Async wrapper around studentService |
| `useTeachers` | ⏸️ Disconnected | Async wrapper around teacherService |
| `useFees` | ⏸️ Disconnected | Async wrapper around feeService |
| `useRealtime` | ⏸️ Disconnected | Supabase real-time subscriptions |

### 8.4 Config
- `src/config/permissions.ts` — centralized RBAC rules for routes, nav, widgets

## 9. Supabase Artifacts (kept for reference)

- `src/lib/supabase.ts` — Supabase client (always falls back to placeholder)
- `src/lib/database.types.ts` — generated DB types
- `supabase/migrations/` — 4 SQL files (schema, RLS, seed, realtime)
- All remain in the codebase but are **not used at runtime** in demo mode

## 10. Styling & Theming

- CSS variable-driven light/dark theme (`src/index.css`)
- Utility classes: `gradient-primary/success/warning/danger/info`, glass effects
- Fonts: Sora (display), Outfit (body), JetBrains Mono (code)
- `App.css` — legacy Vite starter CSS, unused

## 11. Routing Matrix (Updated)

```text
/login          → LoginPage (public)
/               → Navigate → /dashboard
/dashboard      → ProtectedRoute(routeId='dashboard')
/students       → ProtectedRoute(routeId='students')
/teachers       → ProtectedRoute(routeId='teachers')
/attendance     → ProtectedRoute(routeId='attendance')
/fees           → ProtectedRoute(routeId='fees')
/exams          → ProtectedRoute(routeId='exams')
/payroll        → ProtectedRoute(routeId='payroll')
/timetable      → ProtectedRoute(routeId='timetable')
/library        → ProtectedRoute(routeId='library')
/hostel         → ProtectedRoute(routeId='hostel')
/transport      → ProtectedRoute(routeId='transport')
/analytics      → ProtectedRoute(routeId='analytics')
/notifications  → ProtectedRoute(routeId='notifications')
/settings       → ProtectedRoute(routeId='settings')
*               → Navigate → /dashboard
```

`ProtectedRoute` now checks `routePermissions[routeId]` against `user.role`. Unauthorized → redirect + toast.

## 12. Remaining Gaps & Risks

### 12.1 Functional
- **Placeholder toasts only** — All "Add", "Edit", "Delete", "Save", "Export", "Receipt", "Payslip" actions emit toasts but perform no real operation
- **Search in topbar** — UI-only, no routing or filtering
- **Timetable class selector** — UI exists but all classes render the same hardcoded `timetable10A` data
- **Forgot password** — removed along with Supabase login tab

### 12.2 Code Quality
- `useRealtime.ts` — `useState` import at file bottom (line 62)
- Brace-named directories: `src/{app,components/...}` — scaffold artifacts
- Empty folders: `src/components/forms/`, `src/components/tables/`
- Unused `App.css`
- `tsconfig.json` ↔ `tsconfig.app.json` — not aligned (ES2020 vs ES2023, different strictness)

### 12.3 Performance
- ~906 kB bundle, no code-splitting (no `React.lazy`, no `manualChunks`)

## 13. Maturity Snapshot (Updated)

| Layer | Maturity | Notes |
|-------|----------|-------|
| UI completeness | 🟢 High | 15 polished pages, all modules |
| RBAC (routes) | 🟢 Complete | 9-role, 14-route permission matrix |
| RBAC (data scoping) | 🟢 Complete | Per-page role filtering via `useRoleScope` |
| RBAC (sidebar) | 🟢 Complete | Nav items filtered per role |
| RBAC (dashboard) | 🟢 Complete | Widgets filtered per role |
| Backend integration | 🔴 None | Demo-only; service layer disconnected |
| Data persistence | 🔴 None | No writes, no DB |
| Tests/lint/CI | 🔴 None | No scripts configured |
| Code splitting | 🟡 Low | No lazy loading |

## 14. Suggested Next Steps

1. **Remove brace-named directories** — delete `src/{app,components/...}` artifacts
2. **Delete unused `App.css`**
3. **Add `.env.example`** with placeholder Supabase vars
4. **Add code splitting** — `React.lazy` for all page imports (biggest bundle win)
5. **Add lint script** — wire up existing `eslint.config.js`
6. **Align tsconfigs** — consolidate `tsconfig.json` and `tsconfig.app.json`
7. **Wire service layer** (if backend is desired later) — replace mock imports with hooks

## 15. File-Level Quick Map (Updated)

```
src/
├── main.tsx                    — entry point, BrowserRouter, Toaster
├── App.tsx                     — route definitions + ProtectedRoute with RBAC
├── index.css                   — theme variables, utility classes
├── App.css                     — ⚠️ unused legacy CSS
│
├── config/
│   └── permissions.ts          — 🆕 centralized RBAC: routes, nav, widgets
│
├── store/
│   └── useAppStore.ts          — Zustand: auth, UI, notifications (demo-only)
│
├── hooks/
│   ├── usePermissions.ts       — 🆕 RBAC hook (canAccessRoute, canSeeWidget, etc.)
│   ├── useRoleScope.ts         — 🆕 data scoping hook (scopedStudents, canManage, etc.)
│   ├── useStudents.ts          — ⏸️ disconnected async wrapper
│   ├── useTeachers.ts          — ⏸️ disconnected async wrapper
│   ├── useFees.ts              — ⏸️ disconnected async wrapper
│   └── useRealtime.ts          — ⏸️ disconnected Supabase real-time
│
├── services/
│   ├── authService.ts          — ⏸️ Supabase auth (disconnected)
│   ├── studentService.ts       — ⏸️ Supabase CRUD (disconnected)
│   ├── teacherService.ts       — ⏸️ Supabase CRUD (disconnected)
│   ├── attendanceService.ts    — ⏸️ Supabase CRUD (disconnected)
│   ├── feeService.ts           — ⏸️ Supabase CRUD (disconnected)
│   └── notificationService.ts  — ⏸️ Supabase CRUD (disconnected)
│
├── data/
│   ├── students.ts             — mock student records
│   ├── teachers.ts             — mock teacher records
│   ├── fees.ts                 — mock fee records
│   └── analytics.ts            — mock chart data
│
├── types/
│   └── index.ts                — UserRole, User, Student, Teacher, etc.
│
├── layouts/
│   └── AppLayout.tsx           — Sidebar + Topbar + page container
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         — role-filtered navigation
│   │   └── Topbar.tsx          — search, dark mode, notifications, logout
│   ├── shared/
│   │   ├── PageHeader.tsx      — title, breadcrumbs, actions
│   │   ├── KPICard.tsx         — stat card with trend
│   │   └── StatBadge.tsx       — compact stat token
│   ├── charts/
│   │   ├── RevenueChart.tsx
│   │   ├── AttendanceChart.tsx
│   │   ├── GradeChart.tsx
│   │   └── FeeCollectionChart.tsx
│   ├── ui/
│   │   ├── Avatar.tsx, Badge.tsx, Button.tsx, Card.tsx
│   │   ├── EmptyState.tsx, Input.tsx, Select.tsx, Skeleton.tsx
│   ├── forms/                  — ⚠️ empty
│   └── tables/                 — ⚠️ empty
│
├── pages/
│   ├── LoginPage.tsx           — demo-only role selection
│   ├── StudentsPage.tsx        — RBAC + role-scoped
│   ├── TeachersPage.tsx        — RBAC
│   ├── AttendancePage.tsx      — RBAC + role-scoped (view-only for student/parent)
│   ├── FeesPage.tsx            — RBAC + role-scoped (charts hidden for non-finance)
│   ├── ExamsPage.tsx           — RBAC + role-scoped
│   ├── PayrollPage.tsx         — RBAC (status no longer randomized)
│   ├── TimetablePage.tsx       — RBAC + role-default class
│   ├── LibraryPage.tsx         — RBAC (members tab hidden for students)
│   ├── HostelPage.tsx          — RBAC (admin only)
│   ├── TransportPage.tsx       — RBAC (admin + transport manager)
│   ├── AnalyticsPage.tsx       — RBAC (admin only)
│   ├── NotificationsPage.tsx   — all roles
│   └── SettingsPage.tsx        — all roles
│
├── dashboard/
│   └── DashboardPage.tsx       — role-filtered KPIs + charts + data sections
│
└── lib/
    ├── supabase.ts             — Supabase client (placeholder)
    └── database.types.ts       — generated DB types
```

## 16. Conclusion

EduNexus ERP is now a **fully RBAC-gated demo application** with:

- ✅ 9 distinct roles with proper permission boundaries
- ✅ Route-level protection with redirect + toast on unauthorized access
- ✅ Sidebar filtering per role
- ✅ Dashboard widget filtering per role
- ✅ Page-level data scoping — Students/Parents see only their records, Teachers see their class, Admins see everything
- ✅ Admin controls (Add/Edit/Delete/Mark/Bulk actions) hidden from non-admin roles
- ✅ Clean demo-only login (no Supabase auth UX)

The next logical steps for production readiness would be: code splitting via `React.lazy`, removing scaffold artifacts, aligning TypeScript configs, and wiring the service layer to a real backend.
