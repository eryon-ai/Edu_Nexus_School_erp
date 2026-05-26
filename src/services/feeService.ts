import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { feeRecords as mockFees } from '../data/fees'

export const feeService = {
  async getAll(filters: { search?: string; status?: string; school_id?: string } = {}) {
    if (!isSupabaseConfigured) {
      let data = mockFees
      if (filters.search) {
        const q = filters.search.toLowerCase()
        data = data.filter(f => f.studentName.toLowerCase().includes(q) || f.feeType.toLowerCase().includes(q))
      }
      if (filters.status) data = data.filter(f => f.status === filters.status)
      return { data, error: null }
    }

    let query = (supabase as any)
      .from('fee_records')
      .select('*, students(full_name, class, section)')
      .order('due_date', { ascending: false })

    if (filters.school_id) query = query.eq('school_id', filters.school_id)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.search) query = query.or(`fee_type.ilike.%${filters.search}%`)

    const { data, error } = await query
    return {
      data: data ? data.map((f: any) => ({
        id: f.id,
        studentId: f.student_id,
        studentName: f.students?.full_name || '',
        class: `${f.students?.class || ''}${f.students?.section || ''}`,
        feeType: f.fee_type,
        amount: f.amount,
        dueDate: f.due_date,
        paidDate: f.paid_date || undefined,
        status: f.status,
        paymentMethod: f.payment_method || undefined,
      })) : [],
      error,
    }
  },

  async getStats(schoolId?: string) {
    if (!isSupabaseConfigured) {
      return {
        data: {
          collected: mockFees.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0),
          pending: mockFees.filter(f => f.status === 'Pending').reduce((a, f) => a + f.amount, 0),
          overdue: mockFees.filter(f => f.status === 'Overdue').reduce((a, f) => a + f.amount, 0),
        },
        error: null,
      }
    }
    const { data, error } = await (supabase as any).rpc('get_fee_collection_stats', { p_school_id: schoolId || '' })
    return {
      data: data ? { collected: data.total_collected, pending: data.total_pending, overdue: data.total_overdue } : null,
      error,
    }
  },

  async markPaid(id: string, paymentMethod: string) {
    if (!isSupabaseConfigured) return { error: new Error('Supabase not configured') }
    const { error } = await (supabase as any)
      .from('fee_records')
      .update({ status: 'Paid', paid_date: new Date().toISOString().split('T')[0], payment_method: paymentMethod, updated_at: new Date().toISOString() })
      .eq('id', id)
    return { error }
  },
}
