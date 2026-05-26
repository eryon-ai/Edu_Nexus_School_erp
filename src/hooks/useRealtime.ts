import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { notificationService } from '../services/notificationService'
import { Notification } from '../types'

/**
 * Subscribes to real-time Supabase notifications for the logged-in user.
 * New DB inserts automatically appear in the notification bell.
 */
export function useRealtimeNotifications() {
  const { user, addNotification } = useAppStore()

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return

    const channel = notificationService.subscribe(user.id, (payload: any) => {
      const row = payload.new
      if (!row) return
      addNotification({
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type,
        time: 'Just now',
        read: false,
      } as Notification)
    })

    return () => { supabase.removeChannel(channel) }
  }, [user, addNotification])
}

/**
 * Generic real-time channel hook — returns latest payload.
 */
export function useRealtimeChannel(table: string, filter?: string) {
  const [payload, setPayload] = useState<any>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel(`realtime:${table}:${filter || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter }, (p) => setPayload(p))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, filter])

  return payload
}

// useState needs to be imported
import { useState } from 'react'
