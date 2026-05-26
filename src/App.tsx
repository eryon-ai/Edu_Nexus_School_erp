import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './dashboard/DashboardPage'
import { StudentsPage } from './pages/StudentsPage'
import { TeachersPage } from './pages/TeachersPage'
import { AttendancePage } from './pages/AttendancePage'
import { FeesPage } from './pages/FeesPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ExamsPage } from './pages/ExamsPage'
import { PayrollPage } from './pages/PayrollPage'
import { TimetablePage } from './pages/TimetablePage'
import { LibraryPage } from './pages/LibraryPage'
import { HostelPage } from './pages/HostelPage'
import { TransportPage } from './pages/TransportPage'
import { useEffect } from 'react'
import { RouteId, routePermissions } from './config/permissions'
import { toast } from 'sonner'

/**
 * Protected route wrapper that checks both authentication AND role permissions.
 * Unauthenticated users → redirected to /login.
 * Authenticated but unauthorized → redirected to /dashboard with a toast.
 */
function ProtectedRoute({ children, routeId }: { children: React.ReactNode; routeId: RouteId }) {
  const { isAuthenticated, user } = useAppStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role check
  const allowed = routePermissions[routeId]
  const permitted = user?.role && allowed
    ? allowed === '*' || allowed.includes(user.role)
    : false

  if (!permitted) {
    // Avoid infinite redirect loops — only toast + redirect if not already on dashboard
    if (routeId !== 'dashboard') {
      // Use a one-time effect to show toast
      return <RedirectWithToast to="/dashboard" message="You don't have access to this page." />
    }
    // Fallback: render children anyway so dashboard always works
  }

  return <AppLayout>{children}</AppLayout>
}

/** Redirect component that shows a toast once */
function RedirectWithToast({ to, message }: { to: string; message: string }) {
  useEffect(() => { toast.error(message) }, [])
  return <Navigate to={to} replace />
}

export default function App() {
  const { isDarkMode } = useAppStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute routeId="dashboard"><DashboardPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute routeId="students"><StudentsPage /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute routeId="teachers"><TeachersPage /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute routeId="attendance"><AttendancePage /></ProtectedRoute>} />
      <Route path="/fees" element={<ProtectedRoute routeId="fees"><FeesPage /></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute routeId="exams"><ExamsPage /></ProtectedRoute>} />
      <Route path="/payroll" element={<ProtectedRoute routeId="payroll"><PayrollPage /></ProtectedRoute>} />
      <Route path="/timetable" element={<ProtectedRoute routeId="timetable"><TimetablePage /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute routeId="library"><LibraryPage /></ProtectedRoute>} />
      <Route path="/hostel" element={<ProtectedRoute routeId="hostel"><HostelPage /></ProtectedRoute>} />
      <Route path="/transport" element={<ProtectedRoute routeId="transport"><TransportPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute routeId="analytics"><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute routeId="notifications"><NotificationsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute routeId="settings"><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
