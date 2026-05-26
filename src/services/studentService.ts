import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { students as mockStudents } from '../data/students'
import type { Database } from '../lib/database.types'

type Student = Database['public']['Tables']['students']['Row']
type StudentInsert = Database['public']['Tables']['students']['Insert']
type StudentUpdate = Database['public']['Tables']['students']['Update']

export interface StudentFilters {
  search?: string
  status?: string
  class?: string
  section?: string
  school_id?: string
}

// Adapter: Supabase row → legacy app shape
function toAppStudent(s: Student) {
  return {
    id: s.id,
    name: s.full_name,
    rollNo: s.roll_no,
    class: s.class,
    section: s.section,
    gender: s.gender as 'Male' | 'Female',
    dob: s.date_of_birth,
    phone: s.phone || '',
    email: s.email || '',
    address: s.address || '',
    parentName: s.parent_name || '',
    parentPhone: s.parent_phone || '',
    admissionDate: s.admission_date,
    status: s.status,
    avatar: s.avatar_url || undefined,
    feesPaid: false,    // joined from fee_records in real usage
    attendance: 90,     // joined from attendance view in real usage
    grade: 'A',         // joined from exam_results in real usage
  }
}

export const studentService = {
  async getAll(filters: StudentFilters = {}) {
    if (!isSupabaseConfigured) {
      // Demo mode — return mock data with client-side filtering
      let data = mockStudents
      if (filters.search) {
        const q = filters.search.toLowerCase()
        data = data.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.includes(q) ||
          s.email.toLowerCase().includes(q)
        )
      }
      if (filters.status) data = data.filter(s => s.status === filters.status)
      if (filters.class) data = data.filter(s => s.class === filters.class)
      return { data, error: null, count: data.length }
    }

    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .order('full_name')

    if (filters.school_id) query = query.eq('school_id', filters.school_id)
    if (filters.status) query = query.eq('status', filters.status as Student['status'])
    if (filters.class) query = query.eq('class', filters.class)
    if (filters.section) query = query.eq('section', filters.section)
    if (filters.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,roll_no.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      )
    }

    const { data, error, count } = await query
    return {
      data: data ? data.map(toAppStudent) : [],
      error,
      count: count ?? 0,
    }
  },

  async getById(id: string) {
    if (!isSupabaseConfigured) {
      const s = mockStudents.find(s => s.id === id)
      return { data: s || null, error: s ? null : new Error('Not found') }
    }
    const { data, error } = await (supabase as any).from('students').select('*').eq('id', id).single()
    return { data: data ? toAppStudent(data) : null, error }
  },

  async create(student: Omit<StudentInsert, 'school_id'> & { school_id: string }) {
    if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await (supabase as any).from('students').insert(student).select().single()
    return { data: data ? toAppStudent(data) : null, error }
  },

  async update(id: string, updates: StudentUpdate) {
    if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await (supabase as any)
      .from('students')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data: data ? toAppStudent(data) : null, error }
  },

  async delete(id: string) {
    if (!isSupabaseConfigured) return { error: new Error('Supabase not configured') }
    const { error } = await (supabase as any).from('students').delete().eq('id', id)
    return { error }
  },

  async bulkDelete(ids: string[]) {
    if (!isSupabaseConfigured) return { error: new Error('Supabase not configured') }
    const { error } = await (supabase as any).from('students').delete().in('id', ids)
    return { error }
  },

  // Real-time subscription
  subscribe(schoolId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`students:school_id=eq.${schoolId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `school_id=eq.${schoolId}` }, callback)
      .subscribe()
  },
}
