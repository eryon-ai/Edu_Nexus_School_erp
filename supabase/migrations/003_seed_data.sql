-- ══════════════════════════════════════════════════════════════════════════════
-- EduNexus ERP — Demo Seed Data
-- Migration: 003_seed_data.sql
-- Run this after 001 and 002 to populate demo data.
-- ══════════════════════════════════════════════════════════════════════════════

-- Demo school
INSERT INTO schools (id, name, address, city, state, phone, email, board, principal_name, established_year)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Springdale International School',
  '45 Education Hub, Sector 12',
  'Pune',
  'Maharashtra',
  '020-12345678',
  'info@springdale.edu',
  'CBSE',
  'Dr. Meena Krishnamurthy',
  1998
);

-- Demo students
INSERT INTO students (school_id, roll_no, full_name, class, section, gender, date_of_birth, phone, email, address, parent_name, parent_phone, admission_date, status)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','101','Arjun Sharma','10','A','Male','2008-03-15','9876543210','arjun.sharma@student.edu','45 Park Street, Delhi','Rajesh Sharma','9876543200','2020-06-01','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','102','Priya Patel','10','A','Female','2008-07-22','9876543211','priya.patel@student.edu','12 MG Road, Mumbai','Suresh Patel','9876543201','2020-06-01','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','103','Rohit Kumar','10','B','Male','2008-01-10','9876543212','rohit.kumar@student.edu','7 Lake View, Pune','Amit Kumar','9876543202','2020-06-01','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','104','Sneha Reddy','9','A','Female','2009-05-18','9876543213','sneha.reddy@student.edu','33 Hill Road, Hyderabad','Ravi Reddy','9876543203','2021-06-01','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','105','Vikram Singh','9','B','Male','2009-11-25','9876543214','vikram.singh@student.edu','22 Civil Lines, Jaipur','Harjit Singh','9876543204','2021-06-01','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','106','Ananya Gupta','11','A','Female','2007-09-05','9876543215','ananya.gupta@student.edu','56 Residency Road, Bangalore','Deepak Gupta','9876543205','2019-06-01','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','107','Kiran Mehta','12','A','Male','2006-12-30','9876543216','kiran.mehta@student.edu','88 Bandra West, Mumbai','Nitin Mehta','9876543206','2018-06-01','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','108','Pooja Verma','8','A','Female','2010-04-14','9876543217','pooja.verma@student.edu','15 Sector 17, Chandigarh','Rakesh Verma','9876543207','2022-06-01','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','109','Aditya Joshi','7','B','Male','2011-08-20','9876543218','aditya.joshi@student.edu','44 Koregaon Park, Pune','Sunil Joshi','9876543208','2023-06-01','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','110','Meera Nair','12','B','Female','2006-02-28','9876543219','meera.nair@student.edu','9 Palarivattom, Kochi','Vijay Nair','9876543209','2018-06-01','Inactive');

-- Demo teachers
INSERT INTO teachers (school_id, employee_id, full_name, department, subject, qualification, experience_years, phone, email, join_date, salary, status)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','EMP001','Dr. Ravi Shankar','Mathematics','Advanced Mathematics','PhD Mathematics',15,'9845001001','ravi.shankar@springdale.edu','2009-07-01',75000,'Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','EMP002','Mrs. Sunita Kapoor','Sciences','Physics','M.Sc Physics',12,'9845001002','sunita.kapoor@springdale.edu','2012-07-01',68000,'Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','EMP003','Mr. Prakash Rao','Sciences','Chemistry','M.Sc Chemistry',8,'9845001003','prakash.rao@springdale.edu','2016-07-01',62000,'Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','EMP004','Ms. Lakshmi Devi','Languages','English Literature','MA English',10,'9845001004','lakshmi.devi@springdale.edu','2014-07-01',58000,'Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','EMP005','Mr. Ashok Mishra','Social Studies','History & Civics','MA History',20,'9845001005','ashok.mishra@springdale.edu','2004-07-01',82000,'On Leave'),
  ('aaaaaaaa-0000-0000-0000-000000000001','EMP006','Mrs. Preethi Iyer','Computer Science','Computer Applications','MCA',6,'9845001006','preethi.iyer@springdale.edu','2018-07-01',65000,'Active');

-- Demo fee records
INSERT INTO fee_records (school_id, student_id, fee_type, amount, due_date, paid_date, status, payment_method, academic_year)
SELECT
  'aaaaaaaa-0000-0000-0000-000000000001',
  s.id,
  'Tuition Fee',
  CASE WHEN s.class IN ('11','12') THEN 28000 WHEN s.class IN ('9','10') THEN 25000 ELSE 20000 END,
  '2024-04-10',
  CASE WHEN s.roll_no IN ('101','102','104','106','108','109') THEN '2024-04-05' ELSE NULL END,
  CASE WHEN s.roll_no IN ('101','102','104','106','108','109') THEN 'Paid' WHEN s.roll_no IN ('107','110') THEN 'Overdue' ELSE 'Pending' END,
  CASE WHEN s.roll_no IN ('101','102','104','106','108','109') THEN 'Online' ELSE NULL END,
  '2024-25'
FROM students s
WHERE s.school_id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- Demo library books
INSERT INTO library_books (school_id, title, author, isbn, category, total_copies, available_copies)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','Advanced Mathematics — Class 12','R.D. Sharma','978-81-219-1654-0','Academics',12,8),
  ('aaaaaaaa-0000-0000-0000-000000000001','Physics Concepts & Problems','H.C. Verma','978-81-7764-012-3','Academics',8,0),
  ('aaaaaaaa-0000-0000-0000-000000000001','The Alchemist','Paulo Coelho','978-0-06-231609-7','Fiction',5,3),
  ('aaaaaaaa-0000-0000-0000-000000000001','India After Gandhi','Ramachandra Guha','978-0-06-095858-9','History',3,2),
  ('aaaaaaaa-0000-0000-0000-000000000001','Wings of Fire','A.P.J. Abdul Kalam','978-81-7371-793-2','Biography',6,1),
  ('aaaaaaaa-0000-0000-0000-000000000001','Chemistry NCERT Class 11','NCERT','978-81-7450-654-3','Academics',20,15);

-- Demo transport routes
INSERT INTO transport_routes (school_id, route_name, driver_name, driver_phone, vehicle_number, capacity, occupied, stops, timing, status)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','Route 1 — Sector 7','Ramesh Kumar','9845001101','MH-01-AB-1234',40,38,'["Sector 7","Sector 9","MG Road","School"]','7:00 AM – 8:15 AM','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','Route 2 — Civil Lines','Suresh Yadav','9845001102','MH-01-CD-5678',35,32,'["Civil Lines","Gandhi Nagar","Station Road","School"]','6:45 AM – 8:00 AM','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','Route 3 — Banjara Hills','Pradeep Singh','9845001103','MH-01-EF-9012',45,41,'["Banjara Hills","Jubilee Hills","Film Nagar","School"]','7:15 AM – 8:30 AM','Active');

-- Demo hostel blocks
INSERT INTO hostel_blocks (school_id, name, warden_name, capacity, occupied, gender, floors, total_rooms, amenities, status)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','Boys Hostel — Block A','Mr. Santosh Kumar',120,108,'Boys',4,30,'["WiFi","Laundry","Gym","Study Hall"]','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','Boys Hostel — Block B','Mr. Vijay Rao',80,72,'Boys',3,20,'["WiFi","Laundry","TV Room"]','Active'),
  ('aaaaaaaa-0000-0000-0000-000000000001','Girls Hostel — Block C','Mrs. Rekha Sharma',100,95,'Girls',4,25,'["WiFi","Laundry","Gym","Study Hall"]','Active');

-- Demo notifications
INSERT INTO notifications (school_id, title, message, type, read)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','Fee Collection Alert','Q2 fee collection target achieved 94%','success',false),
  ('aaaaaaaa-0000-0000-0000-000000000001','Exam Schedule Update','Final exams rescheduled for March 15–25','warning',false),
  ('aaaaaaaa-0000-0000-0000-000000000001','New Student Admission','Aarav Mehta admitted to Class 8B','info',true),
  ('aaaaaaaa-0000-0000-0000-000000000001','Staff Leave Request','Mr. Ashok Mishra requested 5-day leave','info',true),
  ('aaaaaaaa-0000-0000-0000-000000000001','System Update','ERP system updated to v2.4.0 successfully','success',true);

