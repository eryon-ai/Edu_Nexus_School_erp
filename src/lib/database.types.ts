export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent' | 'accountant' | 'hr' | 'librarian' | 'transport_manager'
          school_id: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      schools: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          board: string | null
          established_year: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['schools']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['schools']['Insert']>
      }
      students: {
        Row: {
          id: string
          school_id: string
          profile_id: string | null
          roll_no: string
          full_name: string
          class: string
          section: string
          gender: 'Male' | 'Female' | 'Other'
          date_of_birth: string
          phone: string | null
          email: string | null
          address: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_email: string | null
          admission_date: string
          status: 'Active' | 'Inactive' | 'Transferred'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      teachers: {
        Row: {
          id: string
          school_id: string
          profile_id: string | null
          employee_id: string
          full_name: string
          department: string
          subject: string
          qualification: string
          experience_years: number
          phone: string | null
          email: string
          join_date: string
          salary: number
          status: 'Active' | 'On Leave' | 'Inactive'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['teachers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['teachers']['Insert']>
      }
      attendance: {
        Row: {
          id: string
          school_id: string
          student_id: string
          date: string
          status: 'Present' | 'Absent' | 'Late' | 'Excused'
          marked_by: string | null
          remarks: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>
      }
      fee_records: {
        Row: {
          id: string
          school_id: string
          student_id: string
          fee_type: string
          amount: number
          due_date: string
          paid_date: string | null
          status: 'Paid' | 'Pending' | 'Overdue' | 'Partial'
          payment_method: string | null
          transaction_id: string | null
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['fee_records']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['fee_records']['Insert']>
      }
      exam_results: {
        Row: {
          id: string
          school_id: string
          student_id: string
          subject: string
          exam_type: string
          exam_date: string
          max_marks: number
          obtained_marks: number
          grade: string
          percentage: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['exam_results']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['exam_results']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          school_id: string | null
          user_id: string | null
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      library_books: {
        Row: {
          id: string
          school_id: string
          title: string
          author: string
          isbn: string | null
          category: string
          total_copies: number
          available_copies: number
          published_year: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['library_books']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['library_books']['Insert']>
      }
      book_issues: {
        Row: {
          id: string
          school_id: string
          book_id: string
          student_id: string
          issue_date: string
          due_date: string
          return_date: string | null
          fine_amount: number
          status: 'Active' | 'Returned' | 'Overdue'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['book_issues']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['book_issues']['Insert']>
      }
      transport_routes: {
        Row: {
          id: string
          school_id: string
          route_name: string
          driver_name: string
          driver_phone: string | null
          vehicle_number: string
          capacity: number
          occupied: number
          stops: Json
          timing: string | null
          status: 'Active' | 'Inactive' | 'Maintenance'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['transport_routes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transport_routes']['Insert']>
      }
      hostel_blocks: {
        Row: {
          id: string
          school_id: string
          name: string
          warden_name: string | null
          capacity: number
          occupied: number
          gender: 'Boys' | 'Girls' | 'Mixed'
          floors: number
          amenities: Json
          status: 'Active' | 'Inactive' | 'Partial'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['hostel_blocks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['hostel_blocks']['Insert']>
      }
      payroll: {
        Row: {
          id: string
          school_id: string
          teacher_id: string
          month: string
          year: number
          gross_salary: number
          pf_deduction: number
          tax_deduction: number
          other_deductions: number
          net_salary: number
          status: 'Paid' | 'Pending' | 'Processing'
          paid_date: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payroll']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payroll']['Insert']>
      }
    }
    Views: {
      student_attendance_summary: {
        Row: {
          student_id: string
          total_days: number
          present_days: number
          absent_days: number
          late_days: number
          attendance_percentage: number
        }
      }
    }
    Functions: {
      get_fee_collection_stats: {
        Args: { p_school_id: string; p_month?: string }
        Returns: { total_collected: number; total_pending: number; total_overdue: number }
      }
    }
  }
}
