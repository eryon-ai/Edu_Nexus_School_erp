import { useState, useEffect, useCallback } from 'react'
import { studentService, StudentFilters } from '../services/studentService'
import { useAppStore } from '../store/useAppStore'
import { toast } from 'sonner'

export function useStudents(initialFilters: StudentFilters = {}) {
  const { user } = useAppStore()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [count, setCount] = useState(0)
  const [filters, setFilters] = useState<StudentFilters>(initialFilters)

  const fetch = useCallback(async () => {
    setLoading(true)
    const result = await studentService.getAll(filters)
    if (result.error) {
      setError(result.error as Error)
      toast.error('Failed to load students')
    } else {
      setData(result.data as any[])
      setCount(result.count)
    }
    setLoading(false)
  }, [filters, user])

  useEffect(() => { fetch() }, [fetch])

  const refresh = () => fetch()
  const updateFilters = (f: Partial<StudentFilters>) => setFilters(prev => ({ ...prev, ...f }))

  return { data, loading, error, count, filters, updateFilters, refresh }
}
