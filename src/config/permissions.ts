import { UserRole } from '../types'

// ─── Route permissions ───────────────────────────────────────────────────────
export type RouteId =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'attendance'
  | 'exams'
  | 'fees'
  | 'payroll'
  | 'timetable'
  | 'library'
  | 'hostel'
  | 'transport'
  | 'analytics'
  | 'notifications'
  | 'settings'

/**
 * Which roles can access each route.
 * key   = RouteId (matches URL path segment)
 * value = array of allowed UserRole values — '*' means all roles.
 */
export const routePermissions: Record<RouteId, UserRole[] | '*'> = {
  dashboard:      '*',
  students:       ['super_admin', 'school_admin', 'teacher'],
  teachers:       ['super_admin', 'school_admin'],
  attendance:     ['super_admin', 'school_admin', 'teacher', 'student', 'parent'],
  exams:          ['super_admin', 'school_admin', 'teacher', 'student', 'parent'],
  fees:           ['super_admin', 'school_admin', 'accountant', 'student', 'parent'],
  payroll:        ['super_admin', 'school_admin', 'accountant', 'hr'],
  timetable:      ['super_admin', 'school_admin', 'teacher', 'student', 'parent'],
  library:        ['super_admin', 'school_admin', 'librarian', 'teacher', 'student'],
  hostel:         ['super_admin', 'school_admin'],
  transport:      ['super_admin', 'school_admin', 'transport_manager'],
  analytics:      ['super_admin', 'school_admin'],
  notifications:  '*',
  settings:       '*',
}

// ─── Sidebar navigation permissions ──────────────────────────────────────────
export interface NavItemPermission {
  routeId: RouteId
  label: string
  roles: UserRole[] | '*'
}

export const navPermissions: NavItemPermission[] = [
  { routeId: 'dashboard',      label: 'Dashboard',      roles: '*' },
  { routeId: 'students',       label: 'Students',       roles: ['super_admin', 'school_admin', 'teacher'] },
  { routeId: 'teachers',       label: 'Teachers',       roles: ['super_admin', 'school_admin'] },
  { routeId: 'attendance',     label: 'Attendance',     roles: ['super_admin', 'school_admin', 'teacher', 'student', 'parent'] },
  { routeId: 'exams',          label: 'Examinations',   roles: ['super_admin', 'school_admin', 'teacher', 'student', 'parent'] },
  { routeId: 'fees',           label: 'Fee Management', roles: ['super_admin', 'school_admin', 'accountant', 'student', 'parent'] },
  { routeId: 'payroll',        label: 'Payroll & HR',   roles: ['super_admin', 'school_admin', 'accountant', 'hr'] },
  { routeId: 'timetable',      label: 'Timetable',      roles: ['super_admin', 'school_admin', 'teacher', 'student', 'parent'] },
  { routeId: 'library',        label: 'Library',        roles: ['super_admin', 'school_admin', 'librarian', 'teacher', 'student'] },
  { routeId: 'hostel',         label: 'Hostel',         roles: ['super_admin', 'school_admin'] },
  { routeId: 'transport',      label: 'Transport',      roles: ['super_admin', 'school_admin', 'transport_manager'] },
  { routeId: 'analytics',      label: 'Analytics',      roles: ['super_admin', 'school_admin'] },
  { routeId: 'notifications',  label: 'Notifications',  roles: '*' },
  { routeId: 'settings',       label: 'Settings',       roles: '*' },
]

// ─── Dashboard widget permissions ────────────────────────────────────────────
export type WidgetId =
  | 'kpi-total-students'
  | 'kpi-teaching-staff'
  | 'kpi-fee-collection'
  | 'kpi-avg-attendance'
  | 'kpi-pass-rate'
  | 'kpi-library-books'
  | 'kpi-pending-fees'
  | 'kpi-notifications'
  | 'chart-revenue'
  | 'chart-grade-distribution'
  | 'chart-fee-collection'
  | 'chart-attendance'
  | 'recent-students'
  | 'recent-activity'
  | 'pending-fees-list'

export const dashboardWidgetPermissions: Record<WidgetId, UserRole[] | '*'> = {
  'kpi-total-students':      ['super_admin', 'school_admin', 'teacher'],
  'kpi-teaching-staff':      ['super_admin', 'school_admin'],
  'kpi-fee-collection':      ['super_admin', 'school_admin', 'accountant'],
  'kpi-avg-attendance':      ['super_admin', 'school_admin', 'teacher', 'student', 'parent'],
  'kpi-pass-rate':           ['super_admin', 'school_admin', 'teacher'],
  'kpi-library-books':       ['super_admin', 'school_admin', 'librarian'],
  'kpi-pending-fees':        ['super_admin', 'school_admin', 'accountant'],
  'kpi-notifications':       '*',
  'chart-revenue':           ['super_admin', 'school_admin', 'accountant'],
  'chart-grade-distribution':['super_admin', 'school_admin', 'teacher', 'student', 'parent'],
  'chart-fee-collection':    ['super_admin', 'school_admin', 'accountant'],
  'chart-attendance':        ['super_admin', 'school_admin', 'teacher', 'student', 'parent'],
  'recent-students':         ['super_admin', 'school_admin', 'teacher'],
  'recent-activity':         '*',
  'pending-fees-list':       ['super_admin', 'school_admin', 'accountant'],
}

// ─── Helper: check if a role is allowed ──────────────────────────────────────
export function hasPermission(role: UserRole, allowed: UserRole[] | '*'): boolean {
  if (allowed === '*') return true
  return allowed.includes(role)
}
