import { useState, useEffect, useCallback } from 'react'
import { feeService } from '../services/feeService'
import { toast } from 'sonner'

export function useFees(initialFilters: { search?: string; status?: string } = {}) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(initialFilters)
  const [stats, setStats] = useState({ collected: 0, pending: 0, overdue: 0 })

  const fetch = useCallback(async () => {
    setLoading(true)
    const [feeResult, statsResult] = await Promise.all([
      feeService.getAll(filters),
      feeService.getStats(),
    ])
    if (feeResult.error) toast.error('Failed to load fee records')
    else setData(feeResult.data)
    if (statsResult.data) setStats(statsResult.data)
    setLoading(false)
  }, [filters])

  useEffect(() => { fetch() }, [fetch])

  const markPaid = async (id: string, method: string) => {
    const { error } = await feeService.markPaid(id, method)
    if (error) toast.error('Failed to update payment')
    else { toast.success('Payment recorded successfully'); fetch() }
  }

  return { data, loading, filters, setFilters, stats, markPaid, refresh: fetch }
}
