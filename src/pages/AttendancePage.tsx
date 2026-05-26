import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Select } from '../components/ui/Select'
import { EmptyState } from '../components/ui/EmptyState'
import { AttendanceChart } from '../components/charts/AttendanceChart'
import { useRoleScope } from '../hooks/useRoleScope'
import { Calendar, CheckCircle, XCircle, Clock, Users, Download, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

const today = new Date().toISOString().split('T')[0]

export function AttendancePage() {
  const { scopedAttendanceStudents, canMarkAttendance, showAttendanceControls, isStudent, isParent, role } = useRoleScope()

  const [selectedClass, setSelectedClass] = useState('10')
  const [selectedDate, setSelectedDate] = useState(today)
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({})

  const classStudents = scopedAttendanceStudents.filter(s => showAttendanceControls ? s.class === selectedClass : true)
  const marked = Object.values(attendance)
  const presentCount = marked.filter(s => s === 'Present').length
  const absentCount = marked.filter(s => s === 'Absent').length
  const lateCount = marked.filter(s => s === 'Late').length

  const mark = (id: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance(prev => ({ ...prev, [id]: status }))
  }

  const markAll = (status: 'Present' | 'Absent') => {
    const all: Record<string, 'Present' | 'Absent' | 'Late'> = {}
    classStudents.forEach(s => { all[s.id] = status })
    setAttendance(all)
  }

  const save = () => {
    toast.success(`Attendance saved for ${classStudents.length} students in Class ${selectedClass}`)
  }

  const title = isStudent ? 'My Attendance' : isParent ? "Child's Attendance" : 'Attendance System'
  const desc = isStudent
    ? 'View your attendance records'
    : isParent
      ? "Track your child's daily attendance"
      : showAttendanceControls
        ? 'Mark and track daily student attendance by class'
        : 'View attendance records'

  return (
    <div>
      <PageHeader
        title={title}
        description={desc}
        breadcrumbs={[{ label: 'Attendance' }]}
        actions={
          showAttendanceControls ? (
            <>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
              <Button size="sm" onClick={save}>Save Attendance</Button>
            </>
          ) : undefined
        }
      />

      {/* Controls — only for teachers/admins */}
      {showAttendanceControls && (
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        <Select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          placeholder="Select Class"
          options={['6','7','8','9','10','11','12'].map(c => ({ value: c, label: `Class ${c}` }))}
        />
          <Button variant="success" size="sm" onClick={() => markAll('Present')}><CheckCircle className="h-4 w-4" />Mark All Present</Button>
          <Button variant="destructive" size="sm" onClick={() => markAll('Absent')}><XCircle className="h-4 w-4" />Mark All Absent</Button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: classStudents.length, color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400' },
          { label: 'Present', value: presentCount, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
          { label: 'Absent', value: absentCount, color: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
          { label: 'Late', value: lateCount, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
            <p className="text-2xl font-bold font-display mt-0.5">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {showAttendanceControls
                  ? `Class ${selectedClass} — ${selectedDate}`
                  : isStudent ? 'My Attendance Records' : "Child's Attendance"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{classStudents.length} student{classStudents.length !== 1 ? 's' : ''}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {classStudents.map((student, i) => {
                  const status = attendance[student.id]
                  const showMarkers = canMarkAttendance
                  return (
                    <motion.div key={student.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                      <Avatar name={student.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">Roll #{student.rollNo} · {student.attendance}% attendance</p>
                      </div>
                      {showMarkers ? (
                        <div className="flex items-center gap-1.5">
                          {(['Present', 'Late', 'Absent'] as const).map(s => (
                            <button key={s} onClick={() => mark(student.id, s as any)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                status === s
                                  ? s === 'Present' ? 'bg-emerald-500 text-white' : s === 'Late' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                  : 'bg-secondary text-muted-foreground hover:bg-accent'
                              }`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <Badge variant={student.attendance >= 90 ? 'success' : student.attendance >= 75 ? 'warning' : 'danger'}>
                          {student.attendance}%
                        </Badge>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div>
          <AttendanceChart />
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-sm">Attendance Rate by Class</CardTitle></CardHeader>
            <CardContent>
              {['6','7','8','9','10','11','12'].map((cls, i) => {
                const rate = 75 + Math.floor(Math.random() * 22)
                return (
                  <div key={cls} className="flex items-center gap-3 mb-3 last:mb-0">
                    <span className="text-xs font-medium w-12">Cls {cls}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        className="h-full rounded-full bg-indigo-500"
                      />
                    </div>
                    <span className="text-xs font-bold w-10 text-right">{rate}%</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
