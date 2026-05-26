export const revenueData = [
  { month: 'Jan', revenue: 4200000, expenses: 2800000, collection: 3900000 },
  { month: 'Feb', revenue: 3800000, expenses: 2600000, collection: 3500000 },
  { month: 'Mar', revenue: 5100000, expenses: 3100000, collection: 4800000 },
  { month: 'Apr', revenue: 4700000, expenses: 2900000, collection: 4400000 },
  { month: 'May', revenue: 5300000, expenses: 3200000, collection: 5000000 },
  { month: 'Jun', revenue: 4900000, expenses: 3000000, collection: 4600000 },
  { month: 'Jul', revenue: 5500000, expenses: 3400000, collection: 5200000 },
  { month: 'Aug', revenue: 5800000, expenses: 3500000, collection: 5400000 },
  { month: 'Sep', revenue: 6100000, expenses: 3700000, collection: 5800000 },
  { month: 'Oct', revenue: 5700000, expenses: 3300000, collection: 5400000 },
  { month: 'Nov', revenue: 6300000, expenses: 3800000, collection: 6000000 },
  { month: 'Dec', revenue: 6800000, expenses: 4000000, collection: 6500000 },
]

export const attendanceData = [
  { week: 'Week 1', present: 92, absent: 8 },
  { week: 'Week 2', present: 88, absent: 12 },
  { week: 'Week 3', present: 95, absent: 5 },
  { week: 'Week 4', present: 91, absent: 9 },
  { week: 'Week 5', present: 87, absent: 13 },
  { week: 'Week 6', present: 93, absent: 7 },
]

export const gradeDistribution = [
  { grade: 'A+', count: 145, percentage: 18 },
  { grade: 'A', count: 228, percentage: 28 },
  { grade: 'B+', count: 195, percentage: 24 },
  { grade: 'B', count: 138, percentage: 17 },
  { grade: 'C+', count: 72, percentage: 9 },
  { grade: 'C', count: 32, percentage: 4 },
]

export const feeCollectionByClass = [
  { class: 'Class 6', collected: 850000, pending: 150000 },
  { class: 'Class 7', collected: 920000, pending: 80000 },
  { class: 'Class 8', collected: 780000, pending: 220000 },
  { class: 'Class 9', collected: 1100000, pending: 100000 },
  { class: 'Class 10', collected: 1350000, pending: 150000 },
  { class: 'Class 11', collected: 980000, pending: 120000 },
  { class: 'Class 12', collected: 1200000, pending: 200000 },
]

export const subjectPerformance = [
  { subject: 'Math', avg: 72, highest: 98, lowest: 45 },
  { subject: 'Science', avg: 76, highest: 96, lowest: 52 },
  { subject: 'English', avg: 80, highest: 99, lowest: 58 },
  { subject: 'History', avg: 74, highest: 95, lowest: 48 },
  { subject: 'Computer', avg: 85, highest: 100, lowest: 62 },
]

export const notifications = [
  { id: '1', title: 'Fee Collection Alert', message: 'Q2 fee collection target achieved 94%', type: 'success' as const, time: '2 min ago', read: false },
  { id: '2', title: 'Exam Schedule Update', message: 'Final exams rescheduled for March 15-25', type: 'warning' as const, time: '15 min ago', read: false },
  { id: '3', title: 'New Student Admission', message: 'Aarav Mehta admitted to Class 8B', type: 'info' as const, time: '1 hr ago', read: true },
  { id: '4', title: 'Staff Leave Request', message: 'Mr. Ashok Mishra requested 5-day leave', type: 'info' as const, time: '2 hr ago', read: true },
  { id: '5', title: 'System Update', message: 'ERP system updated to v2.4.0 successfully', type: 'success' as const, time: '1 day ago', read: true },
]
