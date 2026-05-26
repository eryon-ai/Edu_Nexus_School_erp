import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { gradeDistribution } from '../../data/analytics'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'

const COLORS = ['#6366f1','#8b5cf6','#10b981','#3b82f6','#f59e0b','#ef4444']

export function GradeDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">Student performance breakdown</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="count">
              {gradeDistribution.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [`${value} students (${props.payload.percentage}%)`, props.payload.grade]}
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend iconType="circle" iconSize={8} formatter={(value, entry: any) => entry.payload.grade} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
