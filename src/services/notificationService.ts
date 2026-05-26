import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { notifications as mockNotifs } from '../data/analytics'

export const notificationService = {
  async getForUser(userId: string, schoolId?: string) {
    if (!isSupabaseConfigured) return { data: mockNotifs, error: null }

    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},school_id.eq.${schoolId},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50)

    return { data: data || [], error }
  },

  async markRead(id: string) {
    if (!isSupabaseConfigured) return { error: null }
    const { error } = await (supabase as any).from('notifications').update({ read: true }).eq('id', id)
    return { error }
  },

  async markAllRead(userId: string) {
    if (!isSupabaseConfigured) return { error: null }
    const { error } = await (supabase as any).from('notifications').update({ read: true }).eq('user_id', userId)
    return { error }
  },

  // Real-time notifications channel
  subscribe(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, callback)
      .subscribe()
  },
}
