import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRoleScope } from '../hooks/useRoleScope'
import { ClipboardList, Plus, Download, TrendingUp, Award, Users, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const examSchedule = [
  { id: 'E001', subject: 'Mathematics', class: '10A', date: '2024-03-15', time: '09:00 AM', duration: '3 hrs', maxMarks: 100, type: 'Final', status: 'Upcoming' },
  { id: 'E002', subject: 'Physics', class: '11A', date: '2024-03-16', time: '09:00 AM', duration: '3 hrs', maxMarks: 100, type: 'Final', status: 'Upcoming' },
  { id: 'E003', subject: 'English', class: '10B', date: '2024-03-17', time: '09:00 AM', duration: '3 hrs', maxMarks: 100, type: 'Final', status: 'Upcoming' },
  { id: 'E004', subject: 'Chemistry', class: '12A', date: '2024-03-10', time: '09:00 AM', duration: '3 hrs', maxMarks: 100, type: 'Final', status: 'Completed' },
  { id: 'E005', subject: 'History', class: '9A', date: '2024-03-11', time: '11:00 AM', duration: '2 hrs', maxMarks: 80, type: 'Mid-Term', status: 'Completed' },
  { id: 'E006', subject: 'Computer Science', class: '11B', date: '2024-03-12', time: '09:00 AM', duration: '3 hrs', maxMarks: 100, type: 'Final', status: 'Completed' },
]

const topStudents = [
  { name: 'Priya Patel', class: '10A', score: 98, grade: 'A+' },
  { name: 'Ananya Gupta', class: '11A', score: 96, grade: 'A+' },
  { name: 'Kavya Pillai', class: '11B', score: 95, grade: 'A+' },
  { name: 'Arjun Sharma', class: '10A', score: 94, grade: 'A+' },
  { name: 'Sneha Reddy', class: '9A', score: 91, grade: 'A' },
]

const subjectResults = [
  { subject: 'Math', avg: 72, pass: 92 },
  { subject: 'Physics', avg: 68, pass: 88 },
  { subject: 'Chemistry', avg: 74, pass: 90 },
  { subject: 'English', avg: 80, pass: 96 },
  { subject: 'Computer', avg: 85, pass: 98 },
  { subject: 'History', avg: 75, pass: 94 },
]

const gradeVariant: Record<string, 'success' | 'info' | 'warning' | 'secondary'> = {
  'A+': 'success', A: 'success', 'B+': 'info', B: 'info', 'C+': 'warning', C: 'secondary'
}

export function ExamsPage() {
  const { canManageExams, canViewAllExams, isStudent, isParent, isTeacher } = useRoleScope()
  const [activeTab, setActiveTab] = useState<'schedule' | 'results' | 'analytics'>('schedule')

  const title = isStudent ? 'My Results' : isParent ? "Child's Results" : 'Examination System'
  const desc = isStudent
    ? 'View your exam results and performance'
    : isParent
      ? "Track your child's exam performance"
      : 'Manage exam schedules, results, and academic performance analytics'

  return (
    <div>
      <PageHeader
        title={title}
        description={desc}
        breadcrumbs={[{ label: 'Examinations' }]}
        actions={
          canManageExams ? (
            <>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export Results</Button>
              <Button size="sm" onClick={() => toast.success('Schedule exam form coming soon')}><Plus className="h-4 w-4" />Schedule Exam</Button>
            </>
          ) : undefined
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Exams Scheduled', value: '24', icon: <ClipboardList className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30' },
          { label: 'Avg Pass Rate', value: '93.2%', icon: <TrendingUp className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' },
          { label: 'Top Scorers', value: '142', icon: <Award className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
          { label: 'Subjects', value: '18', icon: <BookOpen className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold font-display">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-secondary rounded-xl p-1 w-fit">
        {(['schedule', 'results', 'analytics'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && canViewAllExams && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Exam ID', 'Subject', 'Class', 'Date', 'Time', 'Duration', 'Max Marks', 'Type', 'Status'].map(h => (
                    <th key={h} className="text-left p-3 sm:p-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {examSchedule.map((exam, i) => (
                  <motion.tr key={exam.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="p-3 sm:p-4 text-[10px] sm:text-xs font-mono text-muted-foreground">{exam.id}</td>
                    <td className="p-3 sm:p-4 text-sm font-semibold">{exam.subject}</td>
                    <td className="p-3 sm:p-4 text-sm">{exam.class}</td>
                    <td className="p-3 sm:p-4 text-sm">{exam.date}</td>
                    <td className="p-3 sm:p-4 text-sm">{exam.time}</td>
                    <td className="p-3 sm:p-4 text-sm">{exam.duration}</td>
                    <td className="p-3 sm:p-4 text-sm font-bold">{exam.maxMarks}</td>
                    <td className="p-3 sm:p-4"><Badge variant="info" className="text-[10px] sm:text-xs">{exam.type}</Badge></td>
                    <td className="p-3 sm:p-4"><Badge variant={exam.status === 'Upcoming' ? 'warning' : 'success'} className="text-[10px] sm:text-xs">{exam.status}</Badge></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Subject-wise Results</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={subjectResults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="subject" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Score" />
                    <Bar dataKey="pass" fill="#10b981" radius={[4, 4, 0, 0]} name="Pass %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Top Performers</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">#{i + 1}</span>
                  </div>
                  <Avatar name={s.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">Class {s.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{s.score}%</p>
                    <Badge variant={gradeVariant[s.grade]}>{s.grade}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {['Pass Rate Trend', 'Average Score Trend'].map((title, i) => (
            <Card key={i}>
              <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={subjectResults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey={i === 0 ? 'pass' : 'avg'} fill={i === 0 ? '#10b981' : '#6366f1'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
