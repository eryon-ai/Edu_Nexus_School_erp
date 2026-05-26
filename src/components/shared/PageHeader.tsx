import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Breadcrumb { label: string; path?: string }

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5"
    >
      {breadcrumbs && (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            <Home className="h-3 w-3" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-foreground transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">{title}</h1>
          {description && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
      </div>
    </motion.div>
  )
}
