import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { attendanceData } from '../../data/analytics'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'

export function AttendanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Attendance</CardTitle>
        <p className="text-xs text-muted-foreground">Student presence rate by week</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={attendanceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} name="Present %" />
            <Bar dataKey="absent" fill="#f87171" radius={[4, 4, 0, 0]} name="Absent %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
