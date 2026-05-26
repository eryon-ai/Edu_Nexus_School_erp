import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { Bell, Sun, Moon, Menu, Search, LogOut, ChevronDown, X } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const LG_BREAKPOINT = 1024

const notifTypeColors = {
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
  info: 'text-blue-500',
}

export function Topbar() {
  const { user, isDarkMode, toggleDarkMode, sidebarCollapsed, setSidebarOpen, notifications, unreadCount, markNotificationRead, markAllRead, logout } = useAppStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= LG_BREAKPOINT : true
  )
  const navigate = useNavigate()

  // Refs for click-outside detection
  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    setIsDesktop(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Click-outside-to-close for popups
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserOpen(false)
      }
    }
    if (notifOpen || userOpen) {
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }
  }, [notifOpen, userOpen])

  // Close popups on route change (via navigate calls)
  const closeAllPopups = () => {
    setNotifOpen(false)
    setUserOpen(false)
    setSearchOpen(false)
  }

  const handleLogout = () => {
    closeAllPopups()
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const goToNotifications = () => {
    closeAllPopups()
    navigate('/notifications')
  }

  const sidebarW = sidebarCollapsed ? 68 : 260
  const leftOffset = isDesktop ? sidebarW : 0

  return (
    <header
      className="fixed top-0 right-0 z-20 h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center gap-2 sm:gap-3 px-3 sm:px-4 transition-all duration-250"
      style={{ left: `${leftOffset}px` }}
    >
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground shrink-0"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile search toggle button */}
      <button
        onClick={() => setSearchOpen(!searchOpen)}
        className="sm:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground shrink-0"
        aria-label="Toggle search"
      >
        {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </button>

      {/* Search bar — hidden on mobile unless toggled */}
      <div className={cn('flex-1 max-w-md', searchOpen ? 'block' : 'hidden sm:block')}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search students, classes, fees..."
            className="h-9 w-full rounded-lg bg-secondary border border-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className={cn('flex items-center gap-0.5 sm:gap-1', searchOpen ? 'hidden sm:flex' : 'ml-auto sm:ml-auto')}>
        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false) }}
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-[2px] rounded-full gradient-danger text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Mobile backdrop */}
          <AnimatePresence>
            {notifOpen && !isDesktop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNotifOpen(false)}
                className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'fixed inset-x-4 top-14 z-50 max-h-[70vh] overflow-y-auto bg-card border border-border rounded-xl shadow-xl',
                  'sm:absolute sm:inset-x-auto sm:right-0 sm:top-10 sm:w-80 sm:max-h-72'
                )}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card rounded-t-xl">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={() => { markAllRead() }} className="text-xs text-primary hover:underline">Mark all read</button>
                  )}
                </div>
                <div className="max-h-60 sm:max-h-56 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-muted-foreground">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { markNotificationRead(n.id) }}
                        className={cn('px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors', !n.read && 'bg-accent/30')}
                      >
                        <div className="flex items-start gap-2">
                          <span className={cn('mt-0.5 h-2 w-2 rounded-full shrink-0', !n.read ? 'gradient-primary' : 'bg-muted')} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-border sticky bottom-0 bg-card rounded-b-xl">
                  <button onClick={goToNotifications} className="text-xs text-primary hover:underline w-full text-center py-1">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserOpen(!userOpen); setNotifOpen(false) }}
              className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Avatar name={user.name} size="xs" />
              <span className="text-xs font-medium hidden sm:block max-w-24 truncate">{user.name.split(' ')[0]}</span>
              <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform', userOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    <Badge variant="default" className="mt-1 text-[10px] capitalize">{user.role.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  )
}
