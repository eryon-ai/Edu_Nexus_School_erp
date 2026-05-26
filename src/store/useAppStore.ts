import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserRole, Notification } from '../types'
import { notifications as mockNotifications } from '../data/analytics'

interface AppState {
  user: User | null
  isAuthenticated: boolean
  isDarkMode: boolean
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  notifications: Notification[]
  unreadCount: number

  // Auth actions
  loginDemo: (role: UserRole) => void
  logout: () => void

  // UI actions
  toggleDarkMode: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  addNotification: (n: Notification) => void
}

const demoRoleUsers: Record<UserRole, User> = {
  super_admin:      { id: 'demo-1', name: 'Vikram Oberoi',   email: 'vikram@edunexus.com',    role: 'super_admin',      school: 'EduNexus Network' },
  school_admin:     { id: 'demo-2', name: 'Priya Kapoor',    email: 'priya@springdale.edu',   role: 'school_admin',     school: 'Springdale International School' },
  teacher:          { id: 'demo-3', name: 'Dr. Ravi Shankar',email: 'ravi@springdale.edu',    role: 'teacher',          school: 'Springdale International School' },
  student:          { id: 'demo-4', name: 'Arjun Sharma',    email: 'arjun@student.edu',      role: 'student',          school: 'Springdale International School' },
  parent:           { id: 'demo-5', name: 'Rajesh Sharma',   email: 'rajesh@gmail.com',       role: 'parent',           school: 'Springdale International School' },
  accountant:       { id: 'demo-6', name: 'Sunita Mehta',    email: 'sunita@springdale.edu',  role: 'accountant',       school: 'Springdale International School' },
  hr:               { id: 'demo-7', name: 'Anita Desai',     email: 'anita@springdale.edu',   role: 'hr',               school: 'Springdale International School' },
  librarian:        { id: 'demo-8', name: 'Ramesh Iyer',     email: 'ramesh@springdale.edu',  role: 'librarian',        school: 'Springdale International School' },
  transport_manager:{ id: 'demo-9', name: 'Mohan Das',       email: 'mohan@springdale.edu',   role: 'transport_manager',school: 'Springdale International School' },
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isDarkMode: false,
      sidebarCollapsed: false,
      sidebarOpen: true,
      notifications: mockNotifications as Notification[],
      unreadCount: mockNotifications.filter(n => !n.read).length,

      // ── Demo login (only mode) ──────────────────────────────────────────────
      loginDemo: (role) => {
        set({ user: demoRoleUsers[role], isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      // ── UI ──────────────────────────────────────────────────────────────────
      toggleDarkMode: () => set((s) => {
        const next = !s.isDarkMode
        document.documentElement.classList.toggle('dark', next)
        return { isDarkMode: next }
      }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      markNotificationRead: (id) => set((s) => {
        const updated = s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        return { notifications: updated, unreadCount: updated.filter(n => !n.read).length }
      }),

      markAllRead: () => set(() => ({
        notifications: [],
        unreadCount: 0,
      })),

      addNotification: (n) => set((s) => ({
        notifications: [n, ...s.notifications],
        unreadCount: s.unreadCount + 1,
      })),
    }),
    {
      name: 'edunexus-store',
      partialize: (s) => ({ isDarkMode: s.isDarkMode, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
