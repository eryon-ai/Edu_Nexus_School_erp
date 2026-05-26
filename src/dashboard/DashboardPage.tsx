import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { usePermissions } from '../hooks/usePermissions'
import { useRoleScope } from '../hooks/useRoleScope'
import { KPICard } from '../components/shared/KPICard'
import { RevenueChart } from '../components/charts/RevenueChart'
import { AttendanceChart } from '../components/charts/AttendanceChart'
import { GradeDistributionChart } from '../components/charts/GradeChart'
import { FeeCollectionChart } from '../components/charts/FeeCollectionChart'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import {
  GraduationCap, Users, DollarSign, TrendingUp, UserCheck,
  BookOpen, Bell, Activity, ArrowRight, Clock
} from 'lucide-react'

interface KpiDef {
  id: string
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  description: string
  icon: JSX.Element
  gradient: string
}

const allKpis: KpiDef[] = [
  { id: 'kpi-total-students',  title: 'Total Students',  value: '2,847', change: 12, changeType: 'increase', description: 'vs last year',     icon: <GraduationCap className="h-5 w-5" />, gradient: 'gradient-primary' },
  { id: 'kpi-teaching-staff',  title: 'Teaching Staff',  value: '186',   change: 5,  changeType: 'increase', description: 'vs last term',    icon: <Users className="h-5 w-5" />,         gradient: 'gradient-info' },
  { id: 'kpi-fee-collection',  title: 'Fee Collection',  value: '₹4.2Cr',change: 8,  changeType: 'increase', description: 'this quarter',   icon: <DollarSign className="h-5 w-5" />,    gradient: 'gradient-success' },
  { id: 'kpi-avg-attendance',  title: 'Avg Attendance',  value: '92.4%', change: 3,  changeType: 'increase', description: 'this week',      icon: <UserCheck className="h-5 w-5" />,     gradient: 'gradient-warning' },
  { id: 'kpi-pass-rate',       title: 'Pass Rate',       value: '96.8%', change: 2,  changeType: 'increase', description: 'last exam',      icon: <TrendingUp className="h-5 w-5" />,    gradient: 'gradient-primary' },
  { id: 'kpi-library-books',   title: 'Library Books',   value: '12,450',change: 4,  changeType: 'increase', description: 'total inventory', icon: <BookOpen className="h-5 w-5" />,      gradient: 'gradient-info' },
  { id: 'kpi-pending-fees',    title: 'Pending Fees',    value: '₹38.2L',change: 5,  changeType: 'decrease', description: 'overdue',         icon: <DollarSign className="h-5 w-5" />,    gradient: 'gradient-danger' },
  { id: 'kpi-notifications',   title: 'Notifications',   value: '14',    change: 0,  changeType: 'increase', description: 'unread today',    icon: <Bell className="h-5 w-5" />,          gradient: 'gradient-warning' },
]

const recentActivities = [
  { action: 'New student admitted', subject: 'Arjun Mehta', time: '5 min ago', type: 'success' as const },
  { action: 'Fee payment received', subject: '₹25,000 from Priya Patel', time: '12 min ago', type: 'success' as const },
  { action: 'Leave request submitted', subject: 'Mr. Ashok Mishra (5 days)', time: '34 min ago', type: 'warning' as const },
  { action: 'Exam schedule published', subject: 'Class 10 Board Prep', time: '1 hr ago', type: 'info' as const },
  { action: 'Transport route updated', subject: 'Route 7 — Sector 15', time: '2 hr ago', type: 'info' as const },
  { action: 'Fee overdue alert', subject: 'Kiran Mehta (Class 12)', time: '3 hr ago', type: 'danger' as const },
]

const activityColors = {
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  danger: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400',
}

export function DashboardPage() {
  const { user } = useAppStore()
  const { canSeeWidget } = usePermissions()
  const { scopedStudents, scopedFees, isStudent, isParent, isTeacher } = useRoleScope()
  const pendingFees = scopedFees.filter(f => f.status !== 'Paid')

  const displayStudents = scopedStudents.slice(0, 5)

  const visibleKpis = allKpis.filter(k => canSeeWidget(k.id as any))
  const showRevenueChart = canSeeWidget('chart-revenue')
  const showGradeChart = canSeeWidget('chart-grade-distribution')
  const showFeeChart = canSeeWidget('chart-fee-collection')
  const showAttendanceChart = canSeeWidget('chart-attendance')
  const showRecentStudents = canSeeWidget('recent-students')
  const showRecentActivity = canSeeWidget('recent-activity')
  const showPendingFees = canSeeWidget('pending-fees-list')

  return (
    <div>
      <PageHeader
        title={`Good morning, ${user?.name.split(' ')[0] || 'Admin'} 👋`}
        description={`Here's what's happening at ${user?.school || 'your school'} today`}
      />

      {/* KPI Grid — role-filtered */}
      {visibleKpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {visibleKpis.map((card, i) => (
            <KPICard key={card.id} {...card} index={i} />
          ))}
        </div>
      )}

      {/* Charts Row 1 */}
      {(showRevenueChart || showGradeChart) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {showRevenueChart && (
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
          )}
          {showGradeChart && <GradeDistributionChart />}
        </div>
      )}

      {/* Charts Row 2 */}
      {(showFeeChart || showAttendanceChart) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {showFeeChart && <FeeCollectionChart />}
          {showAttendanceChart && <AttendanceChart />}
        </div>
      )}

      {/* Bottom Row */}
      {(showRecentStudents || showRecentActivity || showPendingFees) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {showRecentStudents && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>{isStudent ? 'My Profile' : isParent ? 'My Child' : 'Recent Students'}</CardTitle>
                  <a href="/students" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayStudents.map(s => (
                  <div key={s.id} className="flex items-center gap-3">
                    <Avatar name={s.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">Class {s.class}{s.section} • Roll {s.rollNo}</p>
                    </div>
                    <Badge variant={s.status === 'Active' ? 'success' : 'secondary'} className="text-[10px]">
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {showRecentActivity && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${activityColors[a.type]}`}>
                      <span className="text-[8px] font-bold">●</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">{a.action}</p>
                      <p className="text-[10px] text-muted-foreground">{a.subject}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />{a.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {showPendingFees && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Fees</CardTitle>
                  <Badge variant="danger">{pendingFees.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingFees.slice(0, 5).map(fee => (
                  <div key={fee.id} className="flex items-center gap-3">
                    <Avatar name={fee.studentName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{fee.studentName}</p>
                      <p className="text-[10px] text-muted-foreground">{fee.feeType} • Class {fee.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">₹{fee.amount.toLocaleString()}</p>
                      <Badge variant={fee.status === 'Overdue' ? 'danger' : 'warning'} className="text-[10px]">
                        {fee.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
