export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent' | 'accountant' | 'hr' | 'librarian' | 'transport_manager'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  school?: string
}

export interface Student {
  id: string
  name: string
  rollNo: string
  class: string
  section: string
  gender: 'Male' | 'Female'
  dob: string
  phone: string
  email: string
  address: string
  parentName: string
  parentPhone: string
  admissionDate: string
  status: 'Active' | 'Inactive' | 'Transferred'
  avatar?: string
  feesPaid: boolean
  attendance: number
  grade: string
}

export interface Teacher {
  id: string
  name: string
  employeeId: string
  department: string
  subject: string
  qualification: string
  experience: number
  phone: string
  email: string
  joinDate: string
  salary: number
  status: 'Active' | 'On Leave' | 'Inactive'
  avatar?: string
  classes: string[]
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  class: string
  date: string
  status: 'Present' | 'Absent' | 'Late' | 'Excused'
}

export interface FeeRecord {
  id: string
  studentId: string
  studentName: string
  class: string
  feeType: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial'
  paymentMethod?: string
}

export interface ExamResult {
  id: string
  studentId: string
  studentName: string
  class: string
  subject: string
  examType: string
  maxMarks: number
  obtainedMarks: number
  grade: string
  percentage: number
  examDate: string
}

export interface KPICard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease'
  icon: string
  color: string
  description: string
}

export interface NavItem {
  label: string
  path: string
  icon: string
  badge?: number
  children?: NavItem[]
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  time: string
  read: boolean
  avatar?: string
}
