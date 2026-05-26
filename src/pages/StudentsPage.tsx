import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { EmptyState } from '../components/ui/EmptyState'
import { Student } from '../types'
import { useRoleScope } from '../hooks/useRoleScope'
import { useAppStore } from '../store/useAppStore'
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, UserCheck, GraduationCap, Users, TrendingUp, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

const PAGE_SIZE = 8

export function StudentsPage() {
  const { scopedStudents, canManageStudents, canViewAllStudents, admin, isStudent, isParent } = useRoleScope()
  const { user } = useAppStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])

  const filtered = useMemo(() => {
    return scopedStudents.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search) || s.email.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || s.status === statusFilter
      const matchClass = !classFilter || s.class === classFilter
      return matchSearch && matchStatus && matchClass
    })
  }, [search, statusFilter, classFilter, scopedStudents])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }
  const toggleAll = () => {
    setSelected(selected.length === paginated.length ? [] : paginated.map(s => s.id))
  }

  const stats = {
    total: scopedStudents.length,
    active: scopedStudents.filter(s => s.status === 'Active').length,
    feesPaid: scopedStudents.filter(s => s.feesPaid).length,
    avgAttendance: scopedStudents.length ? Math.round(scopedStudents.reduce((a, s) => a + s.attendance, 0) / scopedStudents.length) : 0,
  }

  const statusVariant: Record<Student['status'], 'success' | 'secondary' | 'warning'> = {
    Active: 'success', Inactive: 'secondary', Transferred: 'warning'
  }
  const gradeVariant: Record<string, 'success' | 'info' | 'warning' | 'secondary'> = {
    'A+': 'success', A: 'success', 'B+': 'info', B: 'info', 'C+': 'warning', C: 'secondary'
  }

  // Access denied for student/parent on this page
  if (isStudent || isParent) {
    return (
      <div>
        <PageHeader
          title="My Profile"
          description="Your academic information"
          breadcrumbs={[{ label: 'Students' }]}
        />
        <EmptyState
          icon={<ShieldAlert className="h-8 w-8 text-amber-500" />}
          title="Access Limited"
          description="As a student/parent, you can view your details on the Dashboard, Attendance, and Fees pages."
        />
      </div>
    )
  }

  const title = admin ? 'Student Management' : canViewAllStudents ? 'My Students' : 'Student Records'
  const desc = admin
    ? 'Manage student records, enrollment, and academic information'
    : 'Students enrolled in your classes'

  return (
    <div>
      <PageHeader
        title={title}
        description={desc}
        breadcrumbs={[{ label: 'Students' }]}
        actions={
          canManageStudents ? (
            <>
              <Button variant="outline" size="sm" className="hidden sm:flex"><Download className="h-4 w-4" />Export</Button>
              <Button size="sm" onClick={() => toast.success('Add student form coming soon')}><Plus className="h-4 w-4" />Add Student</Button>
            </>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Students', value: stats.total, icon: <GraduationCap className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30' },
          { label: 'Active', value: stats.active, icon: <UserCheck className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' },
          { label: 'Fees Paid', value: stats.feesPaid, icon: <TrendingUp className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
          { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, icon: <Users className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold font-display">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters — admin/teacher only */}
      {canViewAllStudents && (
        <Card className="mb-5">
          <div className="p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search by name, roll no, email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              placeholder="All Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Transferred', label: 'Transferred' },
              ]}
            />
            <Select
              value={classFilter}
              onChange={e => { setClassFilter(e.target.value); setPage(1) }}
              placeholder="All Classes"
              options={['6','7','8','9','10','11','12'].map(c => ({ value: c, label: `Class ${c}` }))}
            />
            {selected.length > 0 && canManageStudents && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">{selected.length} selected</span>
                <Button variant="outline" size="sm" onClick={() => { toast.success(`Exported ${selected.length} students`); setSelected([]) }}>
                  <Download className="h-3.5 w-3.5" />Export
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { toast.error(`Deleted ${selected.length} students`); setSelected([]) }}>
                  <Trash2 className="h-3.5 w-3.5" />Delete
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {canManageStudents && (
                  <th className="text-left p-4 w-10">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={toggleAll} className="h-4 w-4 rounded border-border" />
                  </th>
                )}
                {['Student', 'Class', 'Parent', ...(canManageStudents ? ['Attendance', 'Grade', 'Fees'] : ['Attendance', 'Grade']), 'Status', ''].map((h, i) => (
                  <th key={i} className="text-left p-3 sm:p-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors group"
                >
                  {canManageStudents && (
                    <td className="p-3 sm:p-4">
                      <input type="checkbox" checked={selected.includes(student.id)} onChange={() => toggleSelect(student.id)} className="h-4 w-4 rounded border-border" />
                    </td>
                  )}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar name={student.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold truncate max-w-[120px] sm:max-w-none">{student.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">#{student.rollNo} · {student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-sm">{student.class}{student.section}</td>
                  <td className="p-3 sm:p-4">
                    <p className="text-xs font-medium truncate max-w-[80px] sm:max-w-none">{student.parentName}</p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">{student.parentPhone}</p>
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 sm:w-16 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${student.attendance}%` }} />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium">{student.attendance}%</span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <Badge variant={gradeVariant[student.grade] || 'secondary'} className="text-[10px] sm:text-xs">{student.grade}</Badge>
                  </td>
                  <td className="p-3 sm:p-4">
                    <Badge variant={student.feesPaid ? 'success' : 'danger'} className="text-[10px] sm:text-xs">{student.feesPaid ? 'Paid' : 'Pending'}</Badge>
                  </td>
                  <td className="p-3 sm:p-4">
                    <Badge variant={statusVariant[student.status]} className="text-[10px] sm:text-xs">{student.status}</Badge>
                  </td>
                  <td className="p-3 sm:p-4">
                    {canManageStudents && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toast.info(`Viewing ${student.name}`)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => toast.info(`Editing ${student.name}`)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => toast.error(`Delete ${student.name}?`)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} students
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => (
              <>
                {i > 0 && arr[i-1] !== p - 1 && <span key={`e${i}`} className="text-xs text-muted-foreground px-1">...</span>}
                <button key={p} onClick={() => setPage(p)}
                  className={`h-7 w-7 text-xs rounded-md font-medium transition-colors ${page === p ? 'gradient-primary text-white' : 'hover:bg-accent text-muted-foreground'}`}>
                  {p}
                </button>
              </>
            ))}
            <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
