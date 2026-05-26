import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Select } from '../components/ui/Select'
import { teachers } from '../data/teachers'
import { Teacher } from '../types'
import { Search, Plus, Download, Eye, Edit, Phone, Mail, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const PAGE_SIZE = 6

export function TeachersPage() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.department.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())
      const matchDept = !deptFilter || t.department === deptFilter
      return matchSearch && matchDept
    })
  }, [search, deptFilter])

  const departments = [...new Set(teachers.map(t => t.department))]
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statusVariant: Record<Teacher['status'], 'success' | 'warning' | 'secondary'> = {
    Active: 'success', 'On Leave': 'warning', Inactive: 'secondary'
  }

  return (
    <div>
      <PageHeader
        title="Teacher Management"
        description="Manage teaching staff, departments, and assignments"
        breadcrumbs={[{ label: 'Teachers' }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
            <Button size="sm" onClick={() => toast.success('Add teacher form coming soon')}><Plus className="h-4 w-4" />Add Teacher</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Staff', value: teachers.length },
          { label: 'Active', value: teachers.filter(t => t.status === 'Active').length },
          { label: 'On Leave', value: teachers.filter(t => t.status === 'On Leave').length },
          { label: 'Departments', value: departments.length },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold font-display mt-0.5">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-5">
        <div className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search by name, subject, department..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1) }}
            placeholder="All Departments"
            options={departments.map(d => ({ value: d, label: d }))}
          />
        </div>
      </Card>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {paginated.map((teacher, i) => (
          <motion.div key={teacher.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar name={teacher.name} size="lg" />
                <div>
                  <p className="font-semibold text-sm">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">{teacher.employeeId}</p>
                </div>
              </div>
              <Badge variant={statusVariant[teacher.status]}>{teacher.status}</Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                <span>{teacher.subject} · {teacher.department}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{teacher.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex gap-3">
                <div className="text-center">
                  <p className="text-xs font-bold">{teacher.experience}y</p>
                  <p className="text-[9px] text-muted-foreground">Exp</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold">{teacher.classes.length}</p>
                  <p className="text-[9px] text-muted-foreground">Classes</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold">₹{(teacher.salary / 1000).toFixed(0)}k</p>
                  <p className="text-[9px] text-muted-foreground">Salary</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toast.info(`Viewing ${teacher.name}`)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => toast.info(`Editing ${teacher.name}`)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} teachers
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
