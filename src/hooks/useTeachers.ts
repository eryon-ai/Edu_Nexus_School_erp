import { useState, useEffect, useCallback } from 'react'
import { teacherService } from '../services/teacherService'
import { useAppStore } from '../store/useAppStore'
import { toast } from 'sonner'

export function useTeachers(initialFilters: { search?: string; department?: string } = {}) {
  const { user } = useAppStore()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(initialFilters)

  const fetch = useCallback(async () => {
    setLoading(true)
    const result = await teacherService.getAll(filters)
    if (result.error) toast.error('Failed to load teachers')
    else setData(result.data)
    setLoading(false)
  }, [filters, user])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, filters, setFilters, refresh: fetch }
}
