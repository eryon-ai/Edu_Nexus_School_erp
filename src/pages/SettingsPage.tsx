import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Moon, Sun, Bell, Shield, Palette, School, Save } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsPage() {
  const { user, isDarkMode, toggleDarkMode } = useAppStore()

  const sections = [
    {
      title: 'Appearance',
      icon: Palette,
      content: (
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-secondary border border-border'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      )
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-3">
          {['Email notifications', 'SMS alerts', 'Fee reminders', 'Exam notifications', 'Attendance alerts'].map(item => (
            <div key={item} className="flex items-center justify-between py-2">
              <p className="text-sm font-medium">{item}</p>
              <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-primary">
                <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow translate-x-4.5" style={{ transform: 'translateX(18px)' }} />
              </button>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Security',
      icon: Shield,
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Current Password</label>
            <input type="password" placeholder="••••••••" className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">New Password</label>
            <input type="password" placeholder="••••••••" className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Button size="sm" onClick={() => toast.success('Password updated successfully')}>Update Password</Button>
        </div>
      )
    },
  ]

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account preferences and system configuration"
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            {user && <Avatar name={user.name} size="xl" className="mx-auto mb-3" />}
            <h3 className="font-semibold">{user?.name}</h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground capitalize">
              {user?.role.replace('_', ' ')}
            </span>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">{user?.school}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => toast.info('Edit profile coming soon')}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Settings sections */}
        <div className="lg:col-span-2 space-y-5">
          {sections.map((section, i) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
                      <section.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                  {section.content}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Button onClick={() => toast.success('Settings saved successfully')} className="w-full">
            <Save className="h-4 w-4" />Save All Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
