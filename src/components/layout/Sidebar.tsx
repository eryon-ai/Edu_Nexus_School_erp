import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'
import { useAppStore } from '../../store/useAppStore'
import { usePermissions } from '../../hooks/usePermissions'
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, BookOpen,
  DollarSign, ClipboardList, Truck, Building2, Library, Calendar,
  Bell, Settings, ChevronLeft, ChevronRight, BarChart3, Banknote,
  X
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, GraduationCap, UserCheck, BookOpen,
  DollarSign, ClipboardList, Truck, Building2, Library, Calendar,
  Bell, Settings, BarChart3, Banknote,
}

export function Sidebar() {
  const { sidebarCollapsed, sidebarOpen, toggleSidebar, setSidebarOpen, user } = useAppStore()
  const { getVisibleNavItems, role } = usePermissions()
  const location = useLocation()

  const visibleNavItems = getVisibleNavItems()

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — fixed overlay on mobile, persistent on desktop */}
      <motion.aside
        animate={{
          width: sidebarCollapsed ? 68 : 260,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-card border-r border-border flex flex-col overflow-hidden shadow-xl',
          'lg:z-30 lg:translate-x-0 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-border shrink-0">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3 overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-bold font-display text-gradient">EduNexus</p>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Enterprise ERP</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User pill */}
        {!sidebarCollapsed && user && (
          <div className="mx-3 mt-3 p-2.5 rounded-lg bg-accent/60 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{user.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}

        {/* Nav — filtered by role */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visibleNavItems.map((item) => {
            const path = `/${item.routeId === 'dashboard' ? 'dashboard' : item.routeId === 'fees' ? 'fees' : item.routeId}`
            const Icon = iconMap[item.label === 'Dashboard' ? 'LayoutDashboard'
              : item.label === 'Students' ? 'GraduationCap'
              : item.label === 'Teachers' ? 'Users'
              : item.label === 'Attendance' ? 'UserCheck'
              : item.label === 'Examinations' ? 'ClipboardList'
              : item.label === 'Fee Management' ? 'DollarSign'
              : item.label === 'Payroll & HR' ? 'Banknote'
              : item.label === 'Timetable' ? 'Calendar'
              : item.label === 'Library' ? 'Library'
              : item.label === 'Hostel' ? 'Building2'
              : item.label === 'Transport' ? 'Truck'
              : item.label === 'Analytics' ? 'BarChart3'
              : item.label === 'Notifications' ? 'Bell'
              : item.label === 'Settings' ? 'Settings'
              : 'LayoutDashboard'] || LayoutDashboard

            const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))
            return (
              <Link key={path} to={path} onClick={() => setSidebarOpen(false)}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group min-h-[40px]',
                    isActive
                      ? 'gradient-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="p-2 border-t border-border hidden lg:block">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center h-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
