import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Truck, MapPin, Users, Route, Plus, Download, Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const routes = [
  { id: 'R001', name: 'Route 1 — Sector 7 to School', driver: 'Ramesh Kumar', vehicle: 'MH-01-AB-1234', capacity: 40, occupied: 38, stops: ['Sector 7', 'Sector 9', 'MG Road', 'School'], status: 'Active', timing: '7:00 AM – 8:15 AM', phone: '9845001101' },
  { id: 'R002', name: 'Route 2 — Civil Lines', driver: 'Suresh Yadav', vehicle: 'MH-01-CD-5678', capacity: 35, occupied: 32, stops: ['Civil Lines', 'Gandhi Nagar', 'Station Road', 'School'], status: 'Active', timing: '6:45 AM – 8:00 AM', phone: '9845001102' },
  { id: 'R003', name: 'Route 3 — Banjara Hills', driver: 'Pradeep Singh', vehicle: 'MH-01-EF-9012', capacity: 45, occupied: 41, stops: ['Banjara Hills', 'Jubilee Hills', 'Film Nagar', 'School'], status: 'Active', timing: '7:15 AM – 8:30 AM', phone: '9845001103' },
  { id: 'R004', name: 'Route 4 — Koregaon Park', driver: 'Dinesh Patil', vehicle: 'MH-01-GH-3456', capacity: 30, occupied: 28, stops: ['Koregaon Park', 'Kalyani Nagar', 'Nagar Road', 'School'], status: 'Maintenance', timing: '7:00 AM – 8:20 AM', phone: '9845001104' },
  { id: 'R005', name: 'Route 5 — Whitefield', driver: 'Mohan Reddy', vehicle: 'MH-01-IJ-7890', capacity: 50, occupied: 44, stops: ['Whitefield', 'ITPL', 'Brookefield', 'School'], status: 'Active', timing: '6:30 AM – 8:00 AM', phone: '9845001105' },
]

const vehicles = [
  { id: 'V001', number: 'MH-01-AB-1234', type: 'Bus', capacity: 40, year: 2020, lastService: '2024-02-15', nextService: '2024-05-15', insurance: '2024-12-31', fitness: '2025-01-20', status: 'Active' },
  { id: 'V002', number: 'MH-01-CD-5678', type: 'Bus', capacity: 35, year: 2019, lastService: '2024-01-20', nextService: '2024-04-20', insurance: '2024-11-30', fitness: '2024-12-15', status: 'Active' },
  { id: 'V003', number: 'MH-01-EF-9012', type: 'Bus', capacity: 45, year: 2021, lastService: '2024-03-01', nextService: '2024-06-01', insurance: '2025-03-31', fitness: '2025-04-10', status: 'Active' },
  { id: 'V004', number: 'MH-01-GH-3456', type: 'Van', capacity: 30, year: 2018, lastService: '2024-03-10', nextService: '2024-04-10', insurance: '2024-09-30', fitness: '2024-10-05', status: 'Maintenance' },
]

export function TransportPage() {
  const [activeTab, setActiveTab] = useState<'routes' | 'vehicles' | 'tracking'>('routes')

  const totalCapacity = routes.reduce((a, r) => a + r.capacity, 0)
  const totalOccupied = routes.reduce((a, r) => a + r.occupied, 0)

  return (
    <div>
      <PageHeader
        title="Transport Management"
        description="Manage school routes, vehicles, drivers, and student transport"
        breadcrumbs={[{ label: 'Transport' }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
            <Button size="sm" onClick={() => toast.success('Add route form coming soon')}><Plus className="h-4 w-4" />Add Route</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Routes', value: routes.length, icon: <Route className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30' },
          { label: 'Total Vehicles', value: vehicles.length, icon: <Truck className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
          { label: 'Students Transported', value: totalOccupied, icon: <Users className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' },
          { label: 'Capacity Used', value: `${Math.round((totalOccupied / totalCapacity) * 100)}%`, icon: <CheckCircle className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold font-display">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-secondary rounded-xl p-1 w-fit">
        {(['routes', 'vehicles', 'tracking'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {routes.map((route, i) => (
            <motion.div key={route.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
              <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${route.status === 'Active' ? 'gradient-primary' : 'bg-amber-500'}`}>
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{route.name}</p>
                        <p className="text-xs text-muted-foreground">{route.vehicle}</p>
                      </div>
                    </div>
                    <Badge variant={route.status === 'Active' ? 'success' : 'warning'}>{route.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />{route.timing}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />{route.phone}
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-semibold">{route.occupied}/{route.capacity} students</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(route.occupied / route.capacity) * 100}%` }}
                        transition={{ delay: i * 0.08 + 0.3, duration: 0.6 }}
                        className="h-full rounded-full gradient-primary"
                      />
                    </div>
                  </div>

                  {/* Stops */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {route.stops.map((stop, si) => (
                      <div key={si} className="flex items-center gap-1">
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{stop}</span>
                        {si < route.stops.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar name={route.driver} size="xs" />
                      <span>{route.driver}</span>
                    </div>
                    <button onClick={() => toast.info(`Viewing route details: ${route.name}`)} className="text-xs text-primary hover:underline">View Details</button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'vehicles' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Vehicle No.', 'Type', 'Capacity', 'Year', 'Last Service', 'Next Service', 'Insurance', 'Status'].map(h => (
                    <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, i) => (
                  <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="p-4 font-mono text-sm font-semibold">{v.number}</td>
                    <td className="p-4 text-sm">{v.type}</td>
                    <td className="p-4 text-sm">{v.capacity} seats</td>
                    <td className="p-4 text-sm">{v.year}</td>
                    <td className="p-4 text-xs text-muted-foreground">{v.lastService}</td>
                    <td className="p-4 text-xs">{v.nextService}</td>
                    <td className="p-4 text-xs text-muted-foreground">{v.insurance}</td>
                    <td className="p-4"><Badge variant={v.status === 'Active' ? 'success' : 'warning'}>{v.status}</Badge></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'tracking' && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live GPS Tracking</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Real-time vehicle tracking will be integrated via GPS API with the Spring Boot backend. Live map view, ETA predictions, and parent notifications.
            </p>
            <Button className="mt-5" onClick={() => toast.info('GPS integration coming with backend')}>
              Enable Live Tracking
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
