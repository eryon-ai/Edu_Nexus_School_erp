import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Building2, Users, BedDouble, Utensils, Plus, Download, Wifi, Shield } from 'lucide-react'
import { toast } from 'sonner'

const hostels = [
  { id: 'H001', name: "Boys' Hostel — Block A", warden: 'Mr. Santosh Kumar', capacity: 120, occupied: 108, rooms: 30, floors: 4, amenities: ['WiFi', 'Laundry', 'Gym', 'Study Hall'], status: 'Active' },
  { id: 'H002', name: "Boys' Hostel — Block B", warden: 'Mr. Vijay Rao', capacity: 80, occupied: 72, rooms: 20, floors: 3, amenities: ['WiFi', 'Laundry', 'TV Room'], status: 'Active' },
  { id: 'H003', name: "Girls' Hostel — Block C", warden: 'Mrs. Rekha Sharma', capacity: 100, occupied: 95, rooms: 25, floors: 4, amenities: ['WiFi', 'Laundry', 'Gym', 'Beauty Parlor'], status: 'Active' },
  { id: 'H004', name: "Girls' Hostel — Block D", warden: 'Mrs. Asha Nair', capacity: 60, occupied: 44, rooms: 15, floors: 3, amenities: ['WiFi', 'Laundry', 'Study Hall'], status: 'Partial' },
]

const residents = [
  { name: 'Arjun Sharma', class: '12A', room: 'B201', block: 'Block A', checkIn: '2023-06-01', fees: 'Paid', meal: 'Veg' },
  { name: 'Rohit Kumar', class: '10B', room: 'A105', block: 'Block A', checkIn: '2023-06-01', fees: 'Pending', meal: 'Non-Veg' },
  { name: 'Kiran Mehta', class: '12B', room: 'B312', block: 'Block B', checkIn: '2023-06-01', fees: 'Paid', meal: 'Veg' },
  { name: 'Vikram Singh', class: '9B', room: 'A208', block: 'Block A', checkIn: '2023-06-01', fees: 'Paid', meal: 'Veg' },
]

export function HostelPage() {
  const [activeTab, setActiveTab] = useState<'blocks' | 'residents' | 'meals'>('blocks')
  const totalCap = hostels.reduce((a, h) => a + h.capacity, 0)
  const totalOcc = hostels.reduce((a, h) => a + h.occupied, 0)

  return (
    <div>
      <PageHeader
        title="Hostel Management"
        description="Manage hostel blocks, rooms, residents, and mess facilities"
        breadcrumbs={[{ label: 'Hostel' }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
            <Button size="sm" onClick={() => toast.success('Add resident form coming soon')}><Plus className="h-4 w-4" />Add Resident</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Blocks', value: hostels.length, icon: <Building2 className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30' },
          { label: 'Total Residents', value: totalOcc, icon: <Users className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' },
          { label: 'Total Rooms', value: hostels.reduce((a, h) => a + h.rooms, 0), icon: <BedDouble className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
          { label: 'Occupancy Rate', value: `${Math.round((totalOcc / totalCap) * 100)}%`, icon: <Shield className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
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
        {(['blocks', 'residents', 'meals'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'blocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {hostels.map((hostel, i) => (
            <motion.div key={hostel.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
              <Card className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-sm">{hostel.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Warden: {hostel.warden}</p>
                    </div>
                    <Badge variant={hostel.status === 'Active' ? 'success' : 'warning'}>{hostel.status}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Capacity', value: hostel.capacity },
                      { label: 'Occupied', value: hostel.occupied },
                      { label: 'Rooms', value: hostel.rooms },
                    ].map((stat, si) => (
                      <div key={si} className="text-center p-2 rounded-lg bg-secondary">
                        <p className="text-base font-bold font-display">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className="font-semibold">{Math.round((hostel.occupied / hostel.capacity) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(hostel.occupied / hostel.capacity) * 100}%` }}
                        transition={{ delay: i * 0.1 + 0.4, duration: 0.6 }}
                        className="h-full rounded-full gradient-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {hostel.amenities.map(a => (
                      <span key={a} className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">{a}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'residents' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Resident', 'Room', 'Block', 'Check-in Date', 'Meal Preference', 'Fees', 'Actions'].map(h => (
                    <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {residents.map((r, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} size="sm" />
                        <div><p className="text-sm font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">Class {r.class}</p></div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono">{r.room}</td>
                    <td className="p-4 text-sm">{r.block}</td>
                    <td className="p-4 text-xs text-muted-foreground">{r.checkIn}</td>
                    <td className="p-4"><Badge variant={r.meal === 'Veg' ? 'success' : 'warning'}>{r.meal}</Badge></td>
                    <td className="p-4"><Badge variant={r.fees === 'Paid' ? 'success' : 'danger'}>{r.fees}</Badge></td>
                    <td className="p-4">
                      <button onClick={() => toast.info(`Viewing ${r.name}'s details`)}
                        className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">View</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'meals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {['Breakfast', 'Lunch', 'Dinner'].map((meal, i) => (
            <motion.div key={meal} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                      <Utensils className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle>{meal}</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">{meal === 'Breakfast' ? '7:00 – 8:30 AM' : meal === 'Lunch' ? '12:30 – 2:00 PM' : '7:30 – 9:00 PM'}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(['Monday','Tuesday','Wednesday','Thursday','Friday'].slice(0, 3)).map(day => (
                      <div key={day} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                        <span className="text-xs font-medium">{day}</span>
                        <span className="text-xs text-muted-foreground">
                          {meal === 'Breakfast' ? 'Idli, Sambar, Chutney' : meal === 'Lunch' ? 'Rice, Dal, Sabji, Roti' : 'Chapati, Paneer, Dal'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
