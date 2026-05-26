import { FeeRecord } from '../types'

export const feeRecords: FeeRecord[] = [
  { id: 'F001', studentId: 'S001', studentName: 'Arjun Sharma', class: '10A', feeType: 'Tuition Fee', amount: 25000, dueDate: '2024-04-10', paidDate: '2024-04-05', status: 'Paid', paymentMethod: 'Online' },
  { id: 'F002', studentId: 'S002', studentName: 'Priya Patel', class: '10A', feeType: 'Tuition Fee', amount: 25000, dueDate: '2024-04-10', paidDate: '2024-04-08', status: 'Paid', paymentMethod: 'Bank Transfer' },
  { id: 'F003', studentId: 'S003', studentName: 'Rohit Kumar', class: '10B', feeType: 'Tuition Fee', amount: 25000, dueDate: '2024-04-10', status: 'Overdue', },
  { id: 'F004', studentId: 'S004', studentName: 'Sneha Reddy', class: '9A', feeType: 'Tuition Fee', amount: 22000, dueDate: '2024-05-10', paidDate: '2024-05-01', status: 'Paid', paymentMethod: 'Cash' },
  { id: 'F005', studentId: 'S005', studentName: 'Vikram Singh', class: '9B', feeType: 'Transport Fee', amount: 8000, dueDate: '2024-05-10', status: 'Pending' },
  { id: 'F006', studentId: 'S006', studentName: 'Ananya Gupta', class: '11A', feeType: 'Lab Fee', amount: 5000, dueDate: '2024-04-15', paidDate: '2024-04-12', status: 'Paid', paymentMethod: 'Online' },
  { id: 'F007', studentId: 'S007', studentName: 'Kiran Mehta', class: '12A', feeType: 'Exam Fee', amount: 3500, dueDate: '2024-03-20', status: 'Overdue' },
  { id: 'F008', studentId: 'S008', studentName: 'Pooja Verma', class: '8A', feeType: 'Annual Fee', amount: 12000, dueDate: '2024-06-01', status: 'Pending' },
]
