import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { RevenueChart } from '../components/charts/RevenueChart'
import { AttendanceChart } from '../components/charts/AttendanceChart'
import { GradeDistributionChart } from '../components/charts/GradeChart'
import { FeeCollectionChart } from '../components/charts/FeeCollectionChart'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { subjectPerformance } from '../data/analytics'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Comprehensive insights across all school operations"
        breadcrumbs={[{ label: 'Analytics' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <RevenueChart />
        <FeeCollectionChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
              <p className="text-xs text-muted-foreground">Average scores across all classes</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="highest" fill="#6366f1" radius={[4,4,0,0]} name="Highest" />
                  <Bar dataKey="avg" fill="#10b981" radius={[4,4,0,0]} name="Average" />
                  <Bar dataKey="lowest" fill="#f59e0b" radius={[4,4,0,0]} name="Lowest" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <GradeDistributionChart />
      </div>
      <AttendanceChart />
    </div>
  )
}
