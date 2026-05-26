import { ReactNode, useEffect, useState } from 'react'
import { Sidebar } from '../components/layout/Sidebar'
import { Topbar } from '../components/layout/Topbar'
import { useAppStore } from '../store/useAppStore'
import { motion } from 'framer-motion'

interface AppLayoutProps { children: ReactNode }

const LG_BREAKPOINT = 1024

export function AppLayout({ children }: AppLayoutProps) {
  const { isDarkMode, sidebarCollapsed } = useAppStore()
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= LG_BREAKPOINT : true
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  // Detect desktop vs mobile for sidebar layout
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    setIsDesktop(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // On mobile: marginLeft = 0 (sidebar is overlay). On desktop: marginLeft = sidebar width.
  const ml = isDesktop ? (sidebarCollapsed ? 68 : 260) : 0

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Sidebar />
      <Topbar />
      <motion.main
        animate={{ marginLeft: ml }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="pt-14 min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-3 sm:p-5 lg:p-7 max-w-screen-2xl mx-auto"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  )
}
