import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRoleScope } from '../hooks/useRoleScope'
import { Banknote, Plus, Download, TrendingUp, Users, DollarSign, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { teachers } from '../data/teachers'
import { toast } from 'sonner'

const payrollMonths = [
  { month: 'Jan', gross: 1820000, net: 1560000, deductions: 260000 },
  { month: 'Feb', gross: 1820000, net: 1558000, deductions: 262000 },
  { month: 'Mar', gross: 1920000, net: 1640000, deductions: 280000 },
  { month: 'Apr', gross: 1820000, net: 1560000, deductions: 260000 },
  { month: 'May', gross: 1820000, net: 1562000, deductions: 258000 },
  { month: 'Jun', gross: 1920000, net: 1645000, deductions: 275000 },
]

const PAGE_SIZE = 6
const fmt = (n: number) => `₹${(n / 1000).toFixed(0)}k`

export function PayrollPage() {
  const { canRunPayroll, canViewPayroll, isHr, isAccountant } = useRoleScope()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeMonth] = useState('May 2024')

  const scopedTeachers = isHr ? teachers : teachers

  const payrollData = useMemo(() =>
    scopedTeachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.department.toLowerCase().includes(search.toLowerCase()))
      .map(t => ({
        ...t,
        gross: t.salary,
        pf: Math.round(t.salary * 0.12),
        tax: Math.round(t.salary * 0.08),
        net: Math.round(t.salary * 0.80),
        status: (t.id === 'demo-7' || Math.random() > 0.2) ? 'Paid' : 'Pending' as 'Paid' | 'Pending',
      }))
  , [search])

  const totalPages = Math.ceil(payrollData.length / PAGE_SIZE)
  const paginated = payrollData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalGross = payrollData.reduce((a, t) => a + t.gross, 0)
  const totalNet = payrollData.reduce((a, t) => a + t.net, 0)

  const title = isHr ? 'HR & Payroll' : isAccountant ? 'Payroll Reports' : 'Payroll Management'
  const desc = isHr ? 'Staff payroll processing' : isAccountant ? 'Salary disbursement reports' : 'Process and track staff salaries, deductions, and payslips'

  return (
    <div>
      <PageHeader
        title={title}
        description={desc}
        breadcrumbs={[{ label: 'Payroll & HR' }]}
        actions={
          canRunPayroll ? (
            <>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" />Download Payslips</Button>
              <Button size="sm" onClick={() => toast.success('Running payroll for ' + activeMonth)}><Banknote className="h-4 w-4" />Run Payroll</Button>
            </>
          ) : (
            <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export Report</Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Gross', value: `₹${(totalGross / 100000).toFixed(1)}L`, icon: <DollarSign className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30' },
          { label: 'Total Net Pay', value: `₹${(totalNet / 100000).toFixed(1)}L`, icon: <Banknote className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' },
          { label: 'Staff Count', value: teachers.length, icon: <Users className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
          { label: 'Pending', value: payrollData.filter(p => p.status === 'Pending').length, icon: <TrendingUp className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold font-display">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Payroll trend chart */}
      <Card className="mb-5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Payroll Trend</CardTitle><p className="text-xs text-muted-foreground mt-1">6-month gross vs net pay</p></div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" />Gross</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />Net</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={payrollMonths}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`₹${(v/1000).toFixed(0)}k`, '']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="gross" stroke="#6366f1" strokeWidth={2} fill="url(#pg)" />
              <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} fill="url(#pn)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payroll table */}
      <Card>
        <div className="p-4 border-b border-border flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Search employee..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span>Period:</span><Badge variant="default">{activeMonth}</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Employee', 'Department', 'Gross Salary', 'PF (12%)', 'Tax (8%)', 'Net Pay', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left p-3 sm:p-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((emp, i) => (
                <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors group">
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar name={emp.name} size="sm" />
                      <div><p className="text-sm font-semibold truncate max-w-[100px] sm:max-w-none">{emp.name}</p><p className="text-[10px] sm:text-xs text-muted-foreground">{emp.employeeId}</p></div>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-sm">{emp.department}</td>
                  <td className="p-3 sm:p-4 text-sm font-bold">{fmt(emp.gross)}</td>
                  <td className="p-3 sm:p-4 text-sm text-red-500">-{fmt(emp.pf)}</td>
                  <td className="p-3 sm:p-4 text-sm text-red-500">-{fmt(emp.tax)}</td>
                  <td className="p-3 sm:p-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmt(emp.net)}</td>
                  <td className="p-3 sm:p-4"><Badge variant={emp.status === 'Paid' ? 'success' : 'warning'} className="text-[10px] sm:text-xs">{emp.status}</Badge></td>
                  <td className="p-3 sm:p-4">
                    <button onClick={() => toast.success(`Payslip downloaded for ${emp.name}`)}
                      className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                      Payslip
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {Math.min((page-1)*PAGE_SIZE+1, payrollData.length)}–{Math.min(page*PAGE_SIZE, payrollData.length)} of {payrollData.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><ChevronLeft className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}><ChevronRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
