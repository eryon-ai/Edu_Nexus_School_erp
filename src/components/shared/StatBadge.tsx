import { cn } from '../../utils/cn'

interface StatBadgeProps {
  label: string
  value: string | number
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
}

export function StatBadge({ label, value, color = 'blue' }: StatBadgeProps) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-2 rounded-lg border text-center', colorMap[color])}>
      <span className="text-lg font-bold font-display">{value}</span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </div>
  )
}
