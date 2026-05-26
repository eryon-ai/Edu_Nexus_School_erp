import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { UserRole } from '../types'
import { students } from '../data/students'
import { teachers } from '../data/teachers'
import { feeRecords } from '../data/fees'

/**
 * Returns role-scoped data and UI flags for every module page.
 * Students / Parents see only their own data.
 * Teachers see their class data.
 * Admins / Finance roles see everything.
 */

// Demo mapping: which demo user is tied to which student record
const demoStudentId = 'S001' // Arjun Sharma — used for student/parent role

function isAdmin(role: UserRole | null): boolean {
  return role === 'super_admin' || role === 'school_admin'
}

function isFinance(role: UserRole | null): boolean {
  return role === 'super_admin' || role === 'school_admin' || role === 'accountant'
}

export function useRoleScope() {
  const { user } = useAppStore()
  const role = user?.role ?? null

  return useMemo(() => {
    // ── Generic helpers ──────────────────────────────────────────────────
    const admin = isAdmin(role)
    const finance = isFinance(role)

    // ── Students module ──────────────────────────────────────────────────
    const scopedStudents = role === 'teacher'
      ? students.filter(s => s.class === '10')  // teacher sees own assigned class
      : (role === 'student' || role === 'parent')
        ? students.filter(s => s.id === demoStudentId)
        : students

    const canManageStudents = admin
    const canViewAllStudents = admin || role === 'teacher'

    // ── Teachers module ──────────────────────────────────────────────────
    const scopedTeachers = role === 'teacher'
      ? teachers.filter(t => t.email === user?.email) // teacher sees only self
      : teachers

    const canManageTeachers = admin
    const canViewAllTeachers = admin

    // ── Attendance module ────────────────────────────────────────────────
    const scopedAttendanceStudents = role === 'student' || role === 'parent'
      ? students.filter(s => s.id === demoStudentId)
      : role === 'teacher'
        ? students.filter(s => s.class === '10')
        : students

    const canMarkAttendance = admin || role === 'teacher'
    const attendanceDefaultClass = role === 'student' || role === 'parent' ? '10' : role === 'teacher' ? '10' : '10'
    const showAttendanceControls = admin || role === 'teacher'

    // ── Fees module ──────────────────────────────────────────────────────
    const scopedFees = role === 'student' || role === 'parent'
      ? feeRecords.filter(f => f.studentId === demoStudentId)
      : feeRecords

    const canManageFees = finance
    const canViewAllFees = finance
    const showFeeCharts = finance
    const showFeeActions = finance

    // ── Exams module ────────────────────────────────────────────────────
    const canManageExams = admin || role === 'teacher'
    const canViewAllExams = admin || role === 'teacher'
    const examStudentScope = role === 'student' || role === 'parent' ? demoStudentId : null

    // ── Payroll module ───────────────────────────────────────────────────
    const canViewPayroll = finance || role === 'hr'
    const canRunPayroll = admin

    // ── Timetable module ─────────────────────────────────────────────────
    const timetableDefaultClass = role === 'student' || role === 'parent' ? '10A'
      : role === 'teacher' ? '10A'
      : '10A'
    const canEditTimetable = admin

    // ── Library module ───────────────────────────────────────────────────
    const canManageLibrary = admin || role === 'librarian'
    const canIssueBooks = admin || role === 'librarian'

    // ── General UI flags ─────────────────────────────────────────────────
    const isStudent = role === 'student'
    const isParent = role === 'parent'
    const isTeacher = role === 'teacher'
    const isAccountant = role === 'accountant'
    const isHr = role === 'hr'
    const isLibrarian = role === 'librarian'

    return {
      // Role checks
      admin, finance, isStudent, isParent, isTeacher, isAccountant, isHr, isLibrarian,
      role,

      // Scoped data
      scopedStudents,
      scopedTeachers,
      scopedAttendanceStudents,
      scopedFees,

      // UI visibility flags
      canManageStudents,
      canViewAllStudents,
      canManageTeachers,
      canViewAllTeachers,
      canMarkAttendance,
      attendanceDefaultClass,
      showAttendanceControls,
      canManageFees,
      canViewAllFees,
      showFeeCharts,
      showFeeActions,
      canManageExams,
      canViewAllExams,
      examStudentScope,
      canViewPayroll,
      canRunPayroll,
      timetableDefaultClass,
      canEditTimetable,
      canManageLibrary,
      canIssueBooks,
    }
  }, [role, user?.email])
}
