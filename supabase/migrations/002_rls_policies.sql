-- ══════════════════════════════════════════════════════════════════════════════
-- EduNexus ERP — Row Level Security (RLS) Policies
-- Migration: 002_rls_policies.sql
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────

-- Get current user's role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get current user's school_id
CREATE OR REPLACE FUNCTION auth_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Is super admin?
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT auth_role() = 'super_admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Is school admin or super admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth_role() IN ('super_admin', 'school_admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Is staff (teacher, HR, accountant, librarian, transport_manager)?
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT auth_role() IN ('super_admin','school_admin','teacher','hr','accountant','librarian','transport_manager');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Does this user belong to a given school?
CREATE OR REPLACE FUNCTION belongs_to_school(p_school_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_super_admin() OR auth_school_id() = p_school_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────
-- ENABLE RLS ON ALL TABLES
-- ─────────────────────────────────────────────────
ALTER TABLE schools             ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE students            ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance          ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_records         ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll             ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_periods   ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books       ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_issues         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_transport   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_blocks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_residents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────
-- SCHOOLS POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "schools_select" ON schools FOR SELECT
  USING (is_super_admin() OR id = auth_school_id());

CREATE POLICY "schools_insert" ON schools FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "schools_update" ON schools FOR UPDATE
  USING (is_super_admin() OR (is_admin() AND id = auth_school_id()));

CREATE POLICY "schools_delete" ON schools FOR DELETE
  USING (is_super_admin());

-- ─────────────────────────────────────────────────
-- PROFILES POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin() OR belongs_to_school(school_id));

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid() OR is_admin());

-- ─────────────────────────────────────────────────
-- STUDENTS POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "students_select" ON students FOR SELECT
  USING (
    belongs_to_school(school_id) AND (
      is_staff()
      OR profile_id = auth.uid()
      -- parents can see their child (linked via parent_email = auth user email)
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND email = students.parent_email)
    )
  );

CREATE POLICY "students_insert" ON students FOR INSERT
  WITH CHECK (is_admin() AND belongs_to_school(school_id));

CREATE POLICY "students_update" ON students FOR UPDATE
  USING (is_admin() AND belongs_to_school(school_id));

CREATE POLICY "students_delete" ON students FOR DELETE
  USING (is_admin() AND belongs_to_school(school_id));

-- ─────────────────────────────────────────────────
-- TEACHERS POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "teachers_select" ON teachers FOR SELECT
  USING (belongs_to_school(school_id) AND is_staff());

CREATE POLICY "teachers_insert" ON teachers FOR INSERT
  WITH CHECK (is_admin() AND belongs_to_school(school_id));

CREATE POLICY "teachers_update" ON teachers FOR UPDATE
  USING (
    belongs_to_school(school_id) AND (
      is_admin()
      OR (auth_role() = 'teacher' AND profile_id = auth.uid())
    )
  );

CREATE POLICY "teachers_delete" ON teachers FOR DELETE
  USING (is_admin() AND belongs_to_school(school_id));

-- ─────────────────────────────────────────────────
-- ATTENDANCE POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "attendance_select" ON attendance FOR SELECT
  USING (
    belongs_to_school(school_id) AND (
      is_staff()
      OR EXISTS (SELECT 1 FROM students s WHERE s.id = attendance.student_id AND s.profile_id = auth.uid())
    )
  );

CREATE POLICY "attendance_insert" ON attendance FOR INSERT
  WITH CHECK (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','teacher'));

CREATE POLICY "attendance_update" ON attendance FOR UPDATE
  USING (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','teacher'));

-- ─────────────────────────────────────────────────
-- FEE RECORDS POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "fees_select" ON fee_records FOR SELECT
  USING (
    belongs_to_school(school_id) AND (
      auth_role() IN ('super_admin','school_admin','accountant')
      OR EXISTS (SELECT 1 FROM students s WHERE s.id = fee_records.student_id AND s.profile_id = auth.uid())
      OR EXISTS (SELECT 1 FROM students s
                 JOIN profiles p ON p.email = s.parent_email
                 WHERE s.id = fee_records.student_id AND p.id = auth.uid())
    )
  );

CREATE POLICY "fees_insert" ON fee_records FOR INSERT
  WITH CHECK (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','accountant'));

CREATE POLICY "fees_update" ON fee_records FOR UPDATE
  USING (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','accountant'));

-- ─────────────────────────────────────────────────
-- EXAM POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "exams_select" ON exam_schedules FOR SELECT
  USING (belongs_to_school(school_id));

CREATE POLICY "exams_insert" ON exam_schedules FOR INSERT
  WITH CHECK (is_admin() AND belongs_to_school(school_id));

CREATE POLICY "results_select" ON exam_results FOR SELECT
  USING (
    belongs_to_school(school_id) AND (
      is_staff()
      OR EXISTS (SELECT 1 FROM students s WHERE s.id = exam_results.student_id AND s.profile_id = auth.uid())
    )
  );

CREATE POLICY "results_insert" ON exam_results FOR INSERT
  WITH CHECK (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','teacher'));

-- ─────────────────────────────────────────────────
-- PAYROLL POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "payroll_select" ON payroll FOR SELECT
  USING (
    belongs_to_school(school_id) AND (
      auth_role() IN ('super_admin','school_admin','hr','accountant')
      OR EXISTS (SELECT 1 FROM teachers t WHERE t.id = payroll.teacher_id AND t.profile_id = auth.uid())
    )
  );

CREATE POLICY "payroll_insert" ON payroll FOR INSERT
  WITH CHECK (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','hr','accountant'));

CREATE POLICY "payroll_update" ON payroll FOR UPDATE
  USING (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','hr','accountant'));

-- ─────────────────────────────────────────────────
-- TIMETABLE POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "timetable_select" ON timetable_periods FOR SELECT
  USING (belongs_to_school(school_id));

CREATE POLICY "timetable_insert" ON timetable_periods FOR INSERT
  WITH CHECK (is_admin() AND belongs_to_school(school_id));

CREATE POLICY "timetable_update" ON timetable_periods FOR UPDATE
  USING (is_admin() AND belongs_to_school(school_id));

-- ─────────────────────────────────────────────────
-- LIBRARY POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "books_select" ON library_books FOR SELECT
  USING (belongs_to_school(school_id));

CREATE POLICY "books_insert" ON library_books FOR INSERT
  WITH CHECK (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','librarian'));

CREATE POLICY "books_update" ON library_books FOR UPDATE
  USING (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','librarian'));

CREATE POLICY "issues_select" ON book_issues FOR SELECT
  USING (
    belongs_to_school(school_id) AND (
      auth_role() IN ('super_admin','school_admin','librarian')
      OR EXISTS (SELECT 1 FROM students s WHERE s.id = book_issues.student_id AND s.profile_id = auth.uid())
    )
  );

CREATE POLICY "issues_insert" ON book_issues FOR INSERT
  WITH CHECK (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','librarian'));

CREATE POLICY "issues_update" ON book_issues FOR UPDATE
  USING (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','librarian'));

-- ─────────────────────────────────────────────────
-- TRANSPORT POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "routes_select" ON transport_routes FOR SELECT
  USING (belongs_to_school(school_id));

CREATE POLICY "routes_insert" ON transport_routes FOR INSERT
  WITH CHECK (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','transport_manager'));

CREATE POLICY "routes_update" ON transport_routes FOR UPDATE
  USING (belongs_to_school(school_id) AND auth_role() IN ('super_admin','school_admin','transport_manager'));

-- ─────────────────────────────────────────────────
-- HOSTEL POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "hostel_select" ON hostel_blocks FOR SELECT
  USING (belongs_to_school(school_id));

CREATE POLICY "hostel_insert" ON hostel_blocks FOR INSERT
  WITH CHECK (is_admin() AND belongs_to_school(school_id));

CREATE POLICY "residents_select" ON hostel_residents FOR SELECT
  USING (
    belongs_to_school(school_id) AND (
      is_staff()
      OR EXISTS (SELECT 1 FROM students s WHERE s.id = hostel_residents.student_id AND s.profile_id = auth.uid())
    )
  );

-- ─────────────────────────────────────────────────
-- NOTIFICATIONS POLICIES
-- ─────────────────────────────────────────────────
CREATE POLICY "notif_select" ON notifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR (school_id = auth_school_id() AND user_id IS NULL)
    OR is_super_admin()
  );

CREATE POLICY "notif_insert" ON notifications FOR INSERT
  WITH CHECK (is_staff());

CREATE POLICY "notif_update_own" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

