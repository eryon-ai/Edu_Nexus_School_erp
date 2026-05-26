import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Select } from '../components/ui/Select'
import { useRoleScope } from '../hooks/useRoleScope'
import { Library, Search, Plus, Download, BookOpen, Users, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const books = [
  { id: 'B001', title: 'Advanced Mathematics — Class 12', author: 'R.D. Sharma', isbn: '978-81-219-1654-0', category: 'Academics', copies: 12, available: 8, status: 'Available' },
  { id: 'B002', title: 'Physics Concepts & Problems', author: 'H.C. Verma', isbn: '978-81-7764-012-3', category: 'Academics', copies: 8, available: 0, status: 'All Issued' },
  { id: 'B003', title: 'The Alchemist', author: 'Paulo Coelho', isbn: '978-0-06-231609-7', category: 'Fiction', copies: 5, available: 3, status: 'Available' },
  { id: 'B004', title: 'India After Gandhi', author: 'Ramachandra Guha', isbn: '978-0-06-095858-9', category: 'History', copies: 3, available: 2, status: 'Available' },
  { id: 'B005', title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', isbn: '978-81-7371-793-2', category: 'Biography', copies: 6, available: 1, status: 'Low Stock' },
  { id: 'B006', title: 'Chemistry NCERT Class 11', author: 'NCERT', isbn: '978-81-7450-654-3', category: 'Academics', copies: 20, available: 15, status: 'Available' },
  { id: 'B007', title: 'English Grammar & Composition', author: 'Wren & Martin', isbn: '978-93-5048-017-2', category: 'Language', copies: 15, available: 7, status: 'Available' },
  { id: 'B008', title: 'The Discovery of India', author: 'Jawaharlal Nehru', isbn: '978-0-14-013579-2', category: 'History', copies: 4, available: 0, status: 'All Issued' },
]

const issuedBooks = [
  { student: 'Arjun Sharma', class: '10A', book: 'Advanced Mathematics', issueDate: '2024-03-01', dueDate: '2024-03-15', status: 'Overdue' },
  { student: 'Priya Patel', class: '10A', book: 'The Alchemist', issueDate: '2024-03-05', dueDate: '2024-03-19', status: 'Active' },
  { student: 'Ananya Gupta', class: '11A', book: 'Wings of Fire', issueDate: '2024-03-08', dueDate: '2024-03-22', status: 'Active' },
  { student: 'Rohit Kumar', class: '10B', book: 'Physics Concepts', issueDate: '2024-02-20', dueDate: '2024-03-05', status: 'Overdue' },
  { student: 'Sneha Reddy', class: '9A', book: 'India After Gandhi', issueDate: '2024-03-10', dueDate: '2024-03-24', status: 'Active' },
]

const PAGE_SIZE = 6

export function LibraryPage() {
  const { canManageLibrary, canIssueBooks, isStudent, isParent, isTeacher, isLibrarian } = useRoleScope()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'books' | 'issued' | 'members'>('books')
  const [page, setPage] = useState(1)

  const title = isStudent ? 'Library' : isLibrarian ? 'Library Management' : 'Library'
  const desc = isStudent
    ? 'Browse available books and your issued books'
    : isTeacher
      ? 'Browse books and manage class resources'
      : 'Manage books, issue records, members, and library inventory'

  const categories = [...new Set(books.map(b => b.category))]

  const filtered = useMemo(() =>
    books.filter(b => {
      const ms = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
      const mc = !categoryFilter || b.category === categoryFilter
      return ms && mc
    })
  , [search, categoryFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statusVariant = (s: string) => s === 'Available' ? 'success' : s === 'All Issued' ? 'danger' : 'warning' as any

  return (
    <div>
      <PageHeader
        title={title}
        description={desc}
        breadcrumbs={[{ label: 'Library' }]}
        actions={
          canManageLibrary ? (
            <>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
              <Button size="sm" onClick={() => toast.success('Add book form coming soon')}><Plus className="h-4 w-4" />Add Book</Button>
            </>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Books', value: books.reduce((a, b) => a + b.copies, 0), icon: <BookOpen className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30' },
          { label: 'Titles', value: books.length, icon: <Library className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
          { label: 'Currently Issued', value: issuedBooks.filter(i => i.status === 'Active').length, icon: <Users className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' },
          { label: 'Overdue', value: issuedBooks.filter(i => i.status === 'Overdue').length, icon: <Clock className="h-4 w-4" />, color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold font-display">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Tabs — hide members tab for students/parents */}
      <div className="flex gap-1 mb-5 bg-secondary rounded-xl p-1 w-fit">
        {(['books', 'issued', ...(canManageLibrary ? ['members'] as const : [])] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'books' && (
        <Card>
          <div className="p-4 border-b border-border flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Search by title or author..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          <Select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
            placeholder="All Categories"
            options={categories.map(c => ({ value: c, label: c }))}
          />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Book ID', 'Title & Author', 'ISBN', 'Category', 'Copies', 'Available', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left p-3 sm:p-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((book, i) => (
                  <motion.tr key={book.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors group">
                    <td className="p-4 text-xs font-mono text-muted-foreground">{book.id}</td>
                    <td className="p-4">
                      <p className="text-sm font-semibold">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </td>
                    <td className="p-4 text-xs font-mono text-muted-foreground">{book.isbn}</td>
                    <td className="p-4"><Badge variant="info">{book.category}</Badge></td>
                    <td className="p-4 text-sm font-bold">{book.copies}</td>
                    <td className="p-4 text-sm">{book.available}</td>
                    <td className="p-4"><Badge variant={statusVariant(book.status)}>{book.status}</Badge></td>
                    <td className="p-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toast.success(`Book issued: ${book.title}`)} className="text-xs text-primary hover:underline">Issue</button>
                        <button onClick={() => toast.info(`Editing: ${book.title}`)} className="text-xs text-muted-foreground hover:text-foreground hover:underline">Edit</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="icon-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'issued' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Student', 'Book', 'Issue Date', 'Due Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issuedBooks.map((issue, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={issue.student} size="sm" />
                        <div><p className="text-sm font-semibold">{issue.student}</p><p className="text-xs text-muted-foreground">Class {issue.class}</p></div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium">{issue.book}</td>
                    <td className="p-4 text-xs text-muted-foreground">{issue.issueDate}</td>
                    <td className="p-4 text-xs">{issue.dueDate}</td>
                    <td className="p-4"><Badge variant={issue.status === 'Active' ? 'success' : 'danger'}>{issue.status}</Badge></td>
                    <td className="p-4">
                      <button onClick={() => toast.success(`Book returned by ${issue.student}`)}
                        className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Return</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'members' && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Library Members</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Full member management with borrowing history, fine tracking, and digital library card will be available with Spring Boot backend integration.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
