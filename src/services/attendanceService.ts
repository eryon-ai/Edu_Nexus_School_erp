import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']

export const attendanceService = {
  async getByDateAndClass(date: string, classVal: string, section: string, schoolId: string) {
    if (!isSupabaseConfigured) return { data: [], error: null }

    const { data, error } = await (supabase as any)
      .from('attendance')
      .select(`*, students!inner(full_name, roll_no, class, section)`)
      .eq('date', date)
      .eq('school_id', schoolId)
      .eq('students.class', classVal)
      .eq('students.section', section)

    return { data: data || [], error }
  },

  async bulkUpsert(records: AttendanceInsert[]) {
    if (!isSupabaseConfigured) return { data: null, error: null }
    const { data, error } = await (supabase as any)
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,date' })
      .select()
    return { data, error }
  },

  async getSummary(studentId: string) {
    if (!isSupabaseConfigured) return { data: null, error: null }
    const { data, error } = await (supabase as any)
      .from('student_attendance_summary')
      .select('*')
      .eq('student_id', studentId)
      .single()
    return { data, error }
  },

  // Real-time listener for live attendance marking
  subscribeToDate(date: string, schoolId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`attendance:${date}:${schoolId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance',
        filter: `school_id=eq.${schoolId}`,
      }, callback)
      .subscribe()
  },
}
