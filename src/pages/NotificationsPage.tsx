import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const typeConfig = {
  info: { icon: Info, className: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
  success: { icon: CheckCircle, className: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  warning: { icon: AlertTriangle, className: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  error: { icon: XCircle, className: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
}

export function NotificationsPage() {
  const { notifications, markAllRead, markNotificationRead, unreadCount } = useAppStore()

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated with all school activities and alerts"
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          unreadCount > 0
            ? <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="h-4 w-4" />Mark all read</Button>
            : undefined
        }
      />

      {unreadCount > 0 && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-accent border border-border flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n, i) => {
          const cfg = typeConfig[n.type]
          const Icon = cfg.icon
          return (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card
                onClick={() => markNotificationRead(n.id)}
                className={`cursor-pointer transition-all hover:shadow-sm ${!n.read ? 'border-primary/30 bg-accent/30' : ''}`}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.className}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full gradient-primary inline-block" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  <Badge variant={n.type === 'error' ? 'danger' : n.type as any}>{n.type}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
