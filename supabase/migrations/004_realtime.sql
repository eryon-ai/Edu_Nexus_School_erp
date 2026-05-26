-- ══════════════════════════════════════════════════════════════════════════════
-- EduNexus ERP — Enable Supabase Realtime
-- Migration: 004_realtime.sql
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable realtime on tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE fee_records;
ALTER PUBLICATION supabase_realtime ADD TABLE students;

-- Create a realtime-safe view for dashboard stats (no RLS bypass needed)
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  s.school_id,
  COUNT(DISTINCT s.id)                                          AS total_students,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'Active')       AS active_students,
  COUNT(DISTINCT t.id)                                          AS total_teachers,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'Active')       AS active_teachers,
  COALESCE(SUM(f.amount) FILTER (WHERE f.status = 'Paid'), 0)   AS fees_collected,
  COALESCE(SUM(f.amount) FILTER (WHERE f.status = 'Pending'), 0) AS fees_pending,
  COALESCE(SUM(f.amount) FILTER (WHERE f.status = 'Overdue'), 0) AS fees_overdue
FROM students s
LEFT JOIN teachers t       ON t.school_id = s.school_id
LEFT JOIN fee_records f    ON f.school_id = s.school_id
GROUP BY s.school_id;

