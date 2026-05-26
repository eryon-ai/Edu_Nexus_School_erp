-- ══════════════════════════════════════════════════════════════════════════════
-- EduNexus ERP — Supabase Database Schema
-- Migration: 001_initial_schema.sql
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ─────────────────────────────────────────────────
-- CUSTOM TYPES
-- ─────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'super_admin', 'school_admin', 'teacher', 'student',
  'parent', 'accountant', 'hr', 'librarian', 'transport_manager'
);

CREATE TYPE student_status   AS ENUM ('Active', 'Inactive', 'Transferred');
CREATE TYPE teacher_status   AS ENUM ('Active', 'On Leave', 'Inactive');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Late', 'Excused');
CREATE TYPE fee_status       AS ENUM ('Paid', 'Pending', 'Overdue', 'Partial');
CREATE TYPE payroll_status   AS ENUM ('Paid', 'Pending', 'Processing');
CREATE TYPE book_issue_status AS ENUM ('Active', 'Returned', 'Overdue');
CREATE TYPE transport_status AS ENUM ('Active', 'Inactive', 'Maintenance');
CREATE TYPE hostel_status    AS ENUM ('Active', 'Inactive', 'Partial');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
CREATE TYPE gender_type      AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE hostel_gender    AS ENUM ('Boys', 'Girls', 'Mixed');

-- ─────────────────────────────────────────────────
-- SCHOOLS
-- ─────────────────────────────────────────────────
CREATE TABLE schools (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  address          TEXT,
  city             TEXT,
  state            TEXT,
  pincode          TEXT,
  phone            TEXT,
  email            TEXT,
  website          TEXT,
  logo_url         TEXT,
  board            TEXT,               -- CBSE, ICSE, State Board, IB, etc.
  established_year INTEGER,
  principal_name   TEXT,
  affiliation_no   TEXT,
  student_count    INTEGER DEFAULT 0,
  teacher_count    INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'student',
  school_id   UUID REFERENCES schools(id) ON DELETE SET NULL,
  avatar_url  TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────────
CREATE TABLE students (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  profile_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  roll_no         TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  class           TEXT NOT NULL,
  section         TEXT NOT NULL DEFAULT 'A',
  gender          gender_type NOT NULL,
  date_of_birth   DATE NOT NULL,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  parent_name     TEXT,
  parent_phone    TEXT,
  parent_email    TEXT,
  admission_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  status          student_status NOT NULL DEFAULT 'Active',
  avatar_url      TEXT,
  blood_group     TEXT,
  nationality     TEXT DEFAULT 'Indian',
  religion        TEXT,
  category        TEXT,       -- General, OBC, SC, ST, etc.
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (school_id, roll_no, class, section)
);

CREATE INDEX idx_students_school     ON students(school_id);
CREATE INDEX idx_students_class      ON students(school_id, class, section);
CREATE INDEX idx_students_status     ON students(status);
CREATE INDEX idx_students_fullname   ON students USING gin(to_tsvector('english', full_name));

-- ─────────────────────────────────────────────────
-- TEACHERS
-- ─────────────────────────────────────────────────
CREATE TABLE teachers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id        UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  profile_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  employee_id      TEXT NOT NULL,
  full_name        TEXT NOT NULL,
  department       TEXT NOT NULL,
  subject          TEXT NOT NULL,
  qualification    TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  phone            TEXT,
  email            TEXT NOT NULL,
  join_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  salary           NUMERIC(12,2) NOT NULL DEFAULT 0,
  status           teacher_status NOT NULL DEFAULT 'Active',
  avatar_url       TEXT,
  address          TEXT,
  date_of_birth    DATE,
  gender           gender_type,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (school_id, employee_id)
);

CREATE INDEX idx_teachers_school     ON teachers(school_id);
CREATE INDEX idx_teachers_department ON teachers(school_id, department);
CREATE INDEX idx_teachers_status     ON teachers(status);

-- Teacher–Class assignments (many-to-many)
CREATE TABLE teacher_class_assignments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id  UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class       TEXT NOT NULL,
  section     TEXT NOT NULL,
  subject     TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2024-25',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (teacher_id, class, section, subject, academic_year)
);

-- ─────────────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────────────
CREATE TABLE attendance (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      attendance_status NOT NULL,
  marked_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  remarks     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, date)
);

CREATE INDEX idx_attendance_student  ON attendance(student_id);
CREATE INDEX idx_attendance_date     ON attendance(date);
CREATE INDEX idx_attendance_school   ON attendance(school_id, date);

-- Attendance summary view
CREATE OR REPLACE VIEW student_attendance_summary AS
SELECT
  student_id,
  COUNT(*)                                            AS total_days,
  COUNT(*) FILTER (WHERE status = 'Present')          AS present_days,
  COUNT(*) FILTER (WHERE status = 'Absent')           AS absent_days,
  COUNT(*) FILTER (WHERE status = 'Late')             AS late_days,
  COUNT(*) FILTER (WHERE status = 'Excused')          AS excused_days,
  ROUND(
    COUNT(*) FILTER (WHERE status IN ('Present','Late')) * 100.0 / NULLIF(COUNT(*), 0),
    2
  )                                                   AS attendance_percentage
FROM attendance
GROUP BY student_id;

-- ─────────────────────────────────────────────────
-- FEE RECORDS
-- ─────────────────────────────────────────────────
CREATE TABLE fee_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id        UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_type         TEXT NOT NULL,       -- Tuition, Transport, Lab, Exam, etc.
  amount           NUMERIC(12,2) NOT NULL,
  paid_amount      NUMERIC(12,2) DEFAULT 0,
  due_date         DATE NOT NULL,
  paid_date        DATE,
  status           fee_status NOT NULL DEFAULT 'Pending',
  payment_method   TEXT,               -- Cash, Online, Bank Transfer, UPI
  transaction_id   TEXT,
  receipt_no       TEXT,
  academic_year    TEXT NOT NULL DEFAULT '2024-25',
  remarks          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fee_student   ON fee_records(student_id);
CREATE INDEX idx_fee_school    ON fee_records(school_id);
CREATE INDEX idx_fee_status    ON fee_records(status);
CREATE INDEX idx_fee_due_date  ON fee_records(due_date);

-- Auto-mark overdue fees
CREATE OR REPLACE FUNCTION update_overdue_fees()
RETURNS void AS $$
  UPDATE fee_records
  SET status = 'Overdue', updated_at = NOW()
  WHERE status = 'Pending'
    AND due_date < CURRENT_DATE;
$$ LANGUAGE sql;

-- Fee collection stats function
CREATE OR REPLACE FUNCTION get_fee_collection_stats(
  p_school_id UUID,
  p_month     TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_collected NUMERIC,
  total_pending   NUMERIC,
  total_overdue   NUMERIC
) AS $$
  SELECT
    COALESCE(SUM(amount) FILTER (WHERE status = 'Paid'),    0) AS total_collected,
    COALESCE(SUM(amount) FILTER (WHERE status = 'Pending'), 0) AS total_pending,
    COALESCE(SUM(amount) FILTER (WHERE status = 'Overdue'), 0) AS total_overdue
  FROM fee_records
  WHERE school_id = p_school_id
    AND (p_month IS NULL OR TO_CHAR(due_date, 'YYYY-MM') = p_month);
$$ LANGUAGE sql STABLE;

-- ─────────────────────────────────────────────────
-- EXAM RESULTS
-- ─────────────────────────────────────────────────
CREATE TABLE exam_schedules (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject      TEXT NOT NULL,
  class        TEXT NOT NULL,
  section      TEXT,
  exam_type    TEXT NOT NULL,       -- Mid-Term, Final, Unit Test, etc.
  exam_date    DATE NOT NULL,
  start_time   TIME,
  duration_min INTEGER,
  max_marks    INTEGER NOT NULL DEFAULT 100,
  venue        TEXT,
  invigilator  UUID REFERENCES teachers(id),
  status       TEXT DEFAULT 'Scheduled',   -- Scheduled, Ongoing, Completed
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exam_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_schedule_id UUID REFERENCES exam_schedules(id) ON DELETE SET NULL,
  subject         TEXT NOT NULL,
  exam_type       TEXT NOT NULL,
  exam_date       DATE NOT NULL,
  max_marks       INTEGER NOT NULL DEFAULT 100,
  obtained_marks  NUMERIC(6,2) NOT NULL,
  grade           TEXT,
  percentage      NUMERIC(5,2) GENERATED ALWAYS AS
                    (ROUND(obtained_marks * 100.0 / NULLIF(max_marks, 0), 2)) STORED,
  remarks         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, exam_schedule_id)
);

CREATE INDEX idx_results_student  ON exam_results(student_id);
CREATE INDEX idx_results_school   ON exam_results(school_id);

-- Auto-compute grade
CREATE OR REPLACE FUNCTION compute_grade(pct NUMERIC)
RETURNS TEXT AS $$
  SELECT CASE
    WHEN pct >= 90 THEN 'A+'
    WHEN pct >= 80 THEN 'A'
    WHEN pct >= 70 THEN 'B+'
    WHEN pct >= 60 THEN 'B'
    WHEN pct >= 50 THEN 'C+'
    WHEN pct >= 40 THEN 'C'
    ELSE 'F'
  END;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION set_exam_grade()
RETURNS TRIGGER AS $$
BEGIN
  NEW.grade = compute_grade(NEW.obtained_marks * 100.0 / NULLIF(NEW.max_marks, 0));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_exam_grade
  BEFORE INSERT OR UPDATE ON exam_results
  FOR EACH ROW EXECUTE FUNCTION set_exam_grade();

-- ─────────────────────────────────────────────────
-- PAYROLL
-- ─────────────────────────────────────────────────
CREATE TABLE payroll (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id        UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id       UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  month            TEXT NOT NULL,      -- '2024-05'
  gross_salary     NUMERIC(12,2) NOT NULL,
  pf_deduction     NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_deduction    NUMERIC(12,2) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_salary       NUMERIC(12,2) GENERATED ALWAYS AS
                     (gross_salary - pf_deduction - tax_deduction - other_deductions) STORED,
  status           payroll_status NOT NULL DEFAULT 'Pending',
  paid_date        DATE,
  payment_method   TEXT,
  transaction_ref  TEXT,
  remarks          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (teacher_id, month)
);

CREATE INDEX idx_payroll_school   ON payroll(school_id);
CREATE INDEX idx_payroll_teacher  ON payroll(teacher_id);
CREATE INDEX idx_payroll_month    ON payroll(month);

-- ─────────────────────────────────────────────────
-- TIMETABLE
-- ─────────────────────────────────────────────────
CREATE TABLE timetable_periods (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class        TEXT NOT NULL,
  section      TEXT NOT NULL,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),  -- 1=Mon
  period_no    SMALLINT NOT NULL CHECK (period_no BETWEEN 1 AND 10),
  subject      TEXT NOT NULL,
  teacher_id   UUID REFERENCES teachers(id) ON DELETE SET NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2024-25',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (school_id, class, section, day_of_week, period_no, academic_year)
);

CREATE INDEX idx_timetable_class ON timetable_periods(school_id, class, section);

-- ─────────────────────────────────────────────────
-- LIBRARY
-- ─────────────────────────────────────────────────
CREATE TABLE library_books (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id        UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  author           TEXT NOT NULL,
  isbn             TEXT,
  category         TEXT NOT NULL,
  publisher        TEXT,
  published_year   INTEGER,
  total_copies     INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  shelf_location   TEXT,
  cover_url        TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CHECK (available_copies >= 0),
  CHECK (available_copies <= total_copies)
);

CREATE INDEX idx_books_school    ON library_books(school_id);
CREATE INDEX idx_books_category  ON library_books(school_id, category);
CREATE INDEX idx_books_title     ON library_books USING gin(to_tsvector('english', title));

CREATE TABLE book_issues (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  book_id      UUID NOT NULL REFERENCES library_books(id) ON DELETE RESTRICT,
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  issue_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date     DATE NOT NULL,
  return_date  DATE,
  fine_amount  NUMERIC(8,2) NOT NULL DEFAULT 0,
  status       book_issue_status NOT NULL DEFAULT 'Active',
  issued_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_issues_student  ON book_issues(student_id);
CREATE INDEX idx_issues_book     ON book_issues(book_id);
CREATE INDEX idx_issues_due      ON book_issues(due_date) WHERE status = 'Active';

-- Decrement available copies on issue
CREATE OR REPLACE FUNCTION handle_book_issue()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE library_books SET available_copies = available_copies - 1, updated_at = NOW()
    WHERE id = NEW.book_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'Returned' AND OLD.status = 'Active' THEN
    UPDATE library_books SET available_copies = available_copies + 1, updated_at = NOW()
    WHERE id = NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_book_issue
  AFTER INSERT OR UPDATE ON book_issues
  FOR EACH ROW EXECUTE FUNCTION handle_book_issue();

-- ─────────────────────────────────────────────────
-- TRANSPORT
-- ─────────────────────────────────────────────────
CREATE TABLE transport_routes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id     UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  route_name    TEXT NOT NULL,
  driver_name   TEXT NOT NULL,
  driver_phone  TEXT,
  driver_license TEXT,
  vehicle_number TEXT NOT NULL,
  vehicle_type  TEXT DEFAULT 'Bus',
  capacity      INTEGER NOT NULL,
  occupied      INTEGER NOT NULL DEFAULT 0,
  stops         JSONB NOT NULL DEFAULT '[]',
  timing        TEXT,
  start_point   TEXT,
  end_point     TEXT,
  distance_km   NUMERIC(8,2),
  monthly_fee   NUMERIC(10,2),
  status        transport_status NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CHECK (occupied >= 0),
  CHECK (occupied <= capacity)
);

CREATE TABLE student_transport (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  route_id    UUID NOT NULL REFERENCES transport_routes(id) ON DELETE RESTRICT,
  pickup_stop TEXT,
  start_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date    DATE,
  status      TEXT DEFAULT 'Active',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, route_id)
);

-- ─────────────────────────────────────────────────
-- HOSTEL
-- ─────────────────────────────────────────────────
CREATE TABLE hostel_blocks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  warden_name  TEXT,
  warden_phone TEXT,
  warden_id    UUID REFERENCES teachers(id) ON DELETE SET NULL,
  capacity     INTEGER NOT NULL,
  occupied     INTEGER NOT NULL DEFAULT 0,
  gender       hostel_gender NOT NULL,
  floors       INTEGER NOT NULL DEFAULT 1,
  total_rooms  INTEGER NOT NULL DEFAULT 0,
  amenities    JSONB NOT NULL DEFAULT '[]',
  status       hostel_status NOT NULL DEFAULT 'Active',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hostel_rooms (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id     UUID NOT NULL REFERENCES hostel_blocks(id) ON DELETE CASCADE,
  room_number  TEXT NOT NULL,
  floor        SMALLINT NOT NULL DEFAULT 1,
  capacity     SMALLINT NOT NULL DEFAULT 2,
  occupied     SMALLINT NOT NULL DEFAULT 0,
  room_type    TEXT DEFAULT 'Sharing',    -- Single, Double, Triple, Sharing
  status       TEXT DEFAULT 'Available',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (block_id, room_number)
);

CREATE TABLE hostel_residents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id     UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  block_id      UUID NOT NULL REFERENCES hostel_blocks(id) ON DELETE RESTRICT,
  room_id       UUID REFERENCES hostel_rooms(id) ON DELETE SET NULL,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_out_date DATE,
  meal_plan     TEXT DEFAULT 'Veg',   -- Veg, Non-Veg
  status        TEXT DEFAULT 'Active',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, block_id)
);

-- ─────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        notification_type NOT NULL DEFAULT 'info',
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  action_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user   ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notif_school ON notifications(school_id, created_at DESC);

-- ─────────────────────────────────────────────────
-- UPDATED_AT TRIGGER (generic)
-- ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_schools_updated_at    BEFORE UPDATE ON schools    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_updated_at   BEFORE UPDATE ON profiles   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_students_updated_at   BEFORE UPDATE ON students   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_teachers_updated_at   BEFORE UPDATE ON teachers   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fee_updated_at        BEFORE UPDATE ON fee_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_books_updated_at      BEFORE UPDATE ON library_books FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_transport_updated_at  BEFORE UPDATE ON transport_routes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

