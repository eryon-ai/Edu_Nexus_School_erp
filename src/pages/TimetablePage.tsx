import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { useRoleScope } from '../hooks/useRoleScope'
import { Calendar, Clock, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const PERIODS = ['8:00–8:45', '8:45–9:30', '9:30–10:15', 'Break', '10:30–11:15', '11:15–12:00', '12:00–12:45', 'Lunch', '1:30–2:15', '2:15–3:00']

const subjectColors: Record<string, string> = {
  'Mathematics': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  'Physics': 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  'Chemistry': 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  'English': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  'History': 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  'Computer': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
  'Biology': 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  'P.E.': 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  'Break': 'bg-muted text-muted-foreground',
  'Lunch': 'bg-muted text-muted-foreground',
  '': 'bg-transparent',
}

const timetable10A: Record<string, string[]> = {
  'Monday':    ['Mathematics', 'Physics', 'English', 'Break', 'Chemistry', 'History', 'Computer', 'Lunch', 'P.E.', 'Mathematics'],
  'Tuesday':   ['English', 'Mathematics', 'Chemistry', 'Break', 'Physics', 'Biology', 'History', 'Lunch', 'Computer', 'English'],
  'Wednesday': ['Physics', 'Chemistry', 'Mathematics', 'Break', 'English', 'Computer', 'Biology', 'Lunch', 'History', 'P.E.'],
  'Thursday':  ['Chemistry', 'English', 'History', 'Break', 'Mathematics', 'Physics', 'P.E.', 'Lunch', 'Computer', 'Biology'],
  'Friday':    ['Computer', 'Biology', 'P.E.', 'Break', 'History', 'Mathematics', 'Physics', 'Lunch', 'English', 'Chemistry'],
  'Saturday':  ['Mathematics', 'English', '', 'Break', 'Physics', 'Chemistry', '', 'Lunch', '', ''],
}

export function TimetablePage() {
  const { timetableDefaultClass, canEditTimetable, isStudent, isParent, isTeacher, admin } = useRoleScope()
  const [selectedClass, setSelectedClass] = useState(timetableDefaultClass)
  const [view, setView] = useState<'class' | 'teacher'>('class')

  const title = isStudent ? 'My Timetable' : isParent ? "Child's Timetable" : 'Timetable Management'
  const desc = isStudent
    ? 'Your weekly class schedule'
    : isParent
      ? "Your child's class schedule"
      : 'View and manage class schedules, teacher assignments, and period timings'

  return (
    <div>
      <PageHeader
        title={title}
        description={desc}
        breadcrumbs={[{ label: 'Timetable' }]}
        actions={
          canEditTimetable ? (
            <>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export PDF</Button>
              <Button size="sm" onClick={() => toast.success('Schedule builder coming soon')}><Plus className="h-4 w-4" />Edit Schedule</Button>
            </>
          ) : undefined
        }
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {admin && (
          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            {(['class', 'teacher'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${view === v ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {v} View
              </button>
            ))}
          </div>
        )}
        <Select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          placeholder="Select Class"
          options={['6A','6B','7A','7B','8A','8B','9A','9B','10A','10B','11A','11B','12A','12B'].map(c => ({ value: c, label: `Class ${c}` }))}
        />
        <Badge variant="info" className="h-9 px-4 flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1.5" />Week of March 11 – 16, 2024
        </Badge>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(subjectColors).filter(([k]) => !['Break','Lunch',''].includes(k)).map(([subject, cls]) => (
          <span key={subject} className={`text-xs px-2.5 py-1 rounded-full font-medium ${cls}`}>{subject}</span>
        ))}
      </div>

      {/* Timetable Grid */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold text-muted-foreground w-28 sticky left-0 bg-card z-10">Period / Day</th>
                {DAYS.map(day => (
                  <th key={day} className="text-center p-3 font-semibold text-muted-foreground min-w-28">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period, pi) => {
                const isBreak = period === 'Break' || period === 'Lunch'
                return (
                  <motion.tr
                    key={period}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: pi * 0.04 }}
                    className={`border-b border-border/50 ${isBreak ? 'bg-muted/30' : 'hover:bg-accent/20 transition-colors'}`}
                  >
                    <td className="p-3 font-medium text-muted-foreground sticky left-0 bg-card dark:bg-card border-r border-border/50 whitespace-nowrap z-10">
                      <div>
                        <p className="font-semibold text-xs">{isBreak ? period : `P${pi < 3 ? pi + 1 : pi < 7 ? pi : pi - 1}`}</p>
                        <p className="text-[10px] text-muted-foreground/70">{period}</p>
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const subject = (timetable10A[day]?.[pi]) || ''
                      const colorClass = subjectColors[subject] || 'bg-transparent'
                      return (
                        <td key={day} className="p-2 text-center">
                          {subject && (
                            <div className={`rounded-lg px-2 py-1.5 font-medium text-[11px] ${colorClass} ${isBreak ? 'opacity-60' : ''}`}>
                              {subject}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {[
          { label: 'Weekly Periods', value: '42', sub: 'Total scheduled' },
          { label: 'Free Periods', value: '6', sub: 'Available slots' },
          { label: 'Subjects', value: '8', sub: 'This class' },
          { label: 'Class Teachers', value: '8', sub: 'Assigned teachers' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold font-display text-gradient">{stat.value}</p>
                <p className="text-xs font-semibold mt-1">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
