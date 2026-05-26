import { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  iconComponent?: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, iconComponent: IconComp, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
        {icon ? icon : IconComp ? <IconComp className="h-8 w-8 text-primary" /> : null}
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
