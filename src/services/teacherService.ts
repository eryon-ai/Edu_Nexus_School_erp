import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { teachers as mockTeachers } from '../data/teachers'
import type { Database } from '../lib/database.types'

type Teacher = Database['public']['Tables']['teachers']['Row']
type TeacherInsert = Database['public']['Tables']['teachers']['Insert']

function toAppTeacher(t: Teacher) {
  return {
    id: t.id,
    name: t.full_name,
    employeeId: t.employee_id,
    department: t.department,
    subject: t.subject,
    qualification: t.qualification,
    experience: t.experience_years,
    phone: t.phone || '',
    email: t.email,
    joinDate: t.join_date,
    salary: t.salary,
    status: t.status,
    avatar: t.avatar_url || undefined,
    classes: [] as string[],
  }
}

export const teacherService = {
  async getAll(filters: { search?: string; department?: string; school_id?: string } = {}) {
    if (!isSupabaseConfigured) {
      let data = mockTeachers
      if (filters.search) {
        const q = filters.search.toLowerCase()
        data = data.filter(t => t.name.toLowerCase().includes(q) || t.department.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q))
      }
      if (filters.department) data = data.filter(t => t.department === filters.department)
      return { data, error: null, count: data.length }
    }

    let query = supabase.from('teachers').select('*', { count: 'exact' }).order('full_name')
    if (filters.school_id) query = query.eq('school_id', filters.school_id)
    if (filters.department) query = query.eq('department', filters.department)
    if (filters.search) query = query.or(`full_name.ilike.%${filters.search}%,department.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`)

    const { data, error, count } = await query
    return { data: data ? data.map(toAppTeacher) : [], error, count: count ?? 0 }
  },

  async getById(id: string) {
    if (!isSupabaseConfigured) {
      const t = mockTeachers.find(t => t.id === id)
      return { data: t || null, error: null }
    }
    const { data, error } = await (supabase as any).from('teachers').select('*').eq('id', id).single()
    return { data: data ? toAppTeacher(data) : null, error }
  },

  async create(teacher: TeacherInsert) {
    if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await (supabase as any).from('teachers').insert(teacher).select().single()
    return { data: data ? toAppTeacher(data) : null, error }
  },

  async update(id: string, updates: Partial<TeacherInsert>) {
    if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await (supabase as any).from('teachers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    return { data: data ? toAppTeacher(data) : null, error }
  },

  async delete(id: string) {
    if (!isSupabaseConfigured) return { error: new Error('Supabase not configured') }
    const { error } = await (supabase as any).from('teachers').delete().eq('id', id)
    return { error }
  },
}
