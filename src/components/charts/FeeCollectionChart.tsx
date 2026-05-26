import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { feeCollectionByClass } from '../../data/analytics'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'

const formatCurrency = (value: number) => `₹${(value / 100000).toFixed(0)}L`

export function FeeCollectionChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Collection by Class</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Collected vs pending amounts</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" />Collected</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400 inline-block" />Pending</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={feeCollectionByClass} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="class" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '']}
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="collected" fill="#6366f1" radius={[4, 4, 0, 0]} name="Collected" stackId="a" />
            <Bar dataKey="pending" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Pending" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
