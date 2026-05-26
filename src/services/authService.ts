import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { UserRole } from '../types'

export const authService = {
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase not configured — running in demo mode') }
    }
    const { data, error } = await (supabase as any).auth.signInWithPassword({ email, password })
    return { data, error }
  },

  async signUp(email: string, password: string, metadata: { full_name: string; role: UserRole; school_id?: string }) {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await (supabase as any).auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
    return { data, error }
  },

  async signOut() {
    if (!isSupabaseConfigured) return { error: null }
    const { error } = await (supabase as any).auth.signOut()
    return { error }
  },

  async getSession() {
    if (!isSupabaseConfigured) return { data: null, error: null }
    const { data, error } = await (supabase as any).auth.getSession()
    return { data, error }
  },

  async getProfile(userId: string) {
    if (!isSupabaseConfigured) return { data: null, error: null }
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*, schools(*)')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId: string, updates: { full_name?: string; phone?: string; avatar_url?: string }) {
    if (!isSupabaseConfigured) return { data: null, error: null }
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured) return { error: new Error('Supabase not configured') }
    const { error } = await (supabase as any).auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
