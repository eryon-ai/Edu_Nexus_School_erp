import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../utils/cn'

interface KPICardProps {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease'
  description: string
  icon: React.ReactNode
  gradient: string
  index?: number
}

export function KPICard({ title, value, change, changeType, description, icon, gradient, index = 0 }: KPICardProps) {
  const isPositive = changeType === 'increase'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold font-display">{value}</p>
        </div>
        <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center text-white', gradient)}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={cn('flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(change)}%
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}
