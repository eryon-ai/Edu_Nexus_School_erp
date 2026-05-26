import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Select } from '../components/ui/Select'
import { FeeRecord } from '../types'
import { useRoleScope } from '../hooks/useRoleScope'
import { Search, Plus, Download, DollarSign, TrendingUp, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { RevenueChart } from '../components/charts/RevenueChart'
import { FeeCollectionChart } from '../components/charts/FeeCollectionChart'

const PAGE_SIZE = 8

export function FeesPage() {
  const { scopedFees, canManageFees, canViewAllFees, showFeeCharts, showFeeActions, isStudent, isParent, role } = useRoleScope()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => scopedFees.filter(f => {
    const matchSearch = f.studentName.toLowerCase().includes(search.toLowerCase()) || f.feeType.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || f.status === statusFilter
    return matchSearch && matchStatus
  }), [search, statusFilter, scopedFees])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalCollected = scopedFees.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0)
  const totalPending = scopedFees.filter(f => f.status !== 'Paid').reduce((a, f) => a + f.amount, 0)

  const statusVariant: Record<FeeRecord['status'], 'success' | 'warning' | 'danger' | 'info'> = {
    Paid: 'success', Pending: 'warning', Overdue: 'danger', Partial: 'info'
  }

  const title = isStudent ? 'My Fees' : isParent ? "Child's Fees" : 'Fee Management'
  const desc = isStudent
    ? 'View your fee payments and pending dues'
    : isParent
      ? "View your child's fee status"
      : 'Track fee collection, pending dues, and payment history'

  return (
    <div>
      <PageHeader
        title={title}
        description={desc}
        breadcrumbs={[{ label: 'Fee Management' }]}
        actions={
          showFeeActions ? (
            <>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
              <Button size="sm" onClick={() => toast.success('Add fee record coming soon')}><Plus className="h-4 w-4" />Add Fee</Button>
            </>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Collected', value: `₹${(totalCollected / 100000).toFixed(1)}L`, icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' },
          { label: 'Pending Amount', value: `₹${(totalPending / 100000).toFixed(1)}L`, icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30' },
          { label: 'Total Records', value: scopedFees.length, icon: <Receipt className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
          { label: 'Overdue', value: scopedFees.filter(f => f.status === 'Overdue').length, icon: <TrendingUp className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold font-display">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts — finance roles only */}
      {showFeeCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          <FeeCollectionChart />
          <RevenueChart />
        </div>
      )}

      {/* Table */}
      <Card className="mb-5">
        {canViewAllFees && (
          <div className="p-4 flex flex-wrap gap-3 border-b border-border">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Search student or fee type..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          <Select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            placeholder="All Status"
            options={[
              { value: 'Paid', label: 'Paid' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Overdue', label: 'Overdue' },
              { value: 'Partial', label: 'Partial' },
            ]}
          />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Student', 'Fee Type', 'Amount', 'Due Date', 'Paid Date', 'Method', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left p-3 sm:p-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((fee, i) => (
                <motion.tr key={fee.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={fee.studentName} size="sm" />
                      <div>
                        <p className="text-sm font-semibold">{fee.studentName}</p>
                        <p className="text-xs text-muted-foreground">Class {fee.class}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{fee.feeType}</td>
                  <td className="p-4 text-sm font-bold">₹{fee.amount.toLocaleString()}</td>
                  <td className="p-4 text-xs text-muted-foreground">{fee.dueDate}</td>
                  <td className="p-4 text-xs text-muted-foreground">{fee.paidDate || '—'}</td>
                  <td className="p-4 text-xs">{fee.paymentMethod || '—'}</td>
                  <td className="p-4"><Badge variant={statusVariant[fee.status]}>{fee.status}</Badge></td>
                  <td className="p-4">
                    <button onClick={() => toast.info(`Receipt for ${fee.studentName}`)}
                      className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Receipt className="h-3 w-3" />Receipt
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><ChevronLeft className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}><ChevronRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
