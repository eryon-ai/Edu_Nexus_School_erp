# 🔧 EduNexus ERP — Backend Setup Guide

> **Three complete backend implementations** — Supabase (BaaS), Spring Boot (Java), and Next.js (Full-stack React)

---

## 📋 Table of Contents

- [Prerequisites (All Backends)](#prerequisites-all-backends)
- [Option 1: Supabase (BaaS)](#option-1-supabase-baas)
- [Option 2: Spring Boot (Java)](#option-2-spring-boot-java)
- [Option 3: Next.js (Full-stack)](#option-3-nextjs-full-stack)
- [Frontend Wiring Guide](#frontend-wiring-guide)
- [Comparison Matrix](#comparison-matrix)

---

## Prerequisites (All Backends)

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | ≥ 18.x | Frontend dev server |
| **npm** | ≥ 9.x | Package management |
| **Git** | ≥ 2.x | Version control |
| **VS Code** | Latest | IDE (recommended) |

---

# Option 1: Supabase (BaaS)

> **Fastest path to production.** Managed PostgreSQL + Auth + Realtime + Storage + Edge Functions.  
> **Time to deploy:** ~30 minutes  
> **Monthly cost:** Free tier (2 projects, 500 MB DB, 50,000 MAU)

---

## 1.1 Create Supabase Project

### Step 1: Sign Up
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub or email
3. Click **"New Project"**

### Step 2: Configure Project
```
Organization:  Your org name
Name:           edunexus-erp
Database Password: [generate a strong password — SAVE IT]
Region:         Asia Pacific (Mumbai) — or closest to your users
Pricing Plan:   Free ($0/month)
```
Click **Create project** — wait 2 minutes for provisioning.

### Step 3: Get API Keys
1. Go to **Settings → API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (e.g., `https://abc123def.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

---

## 1.2 Configure Environment

Create `.env` in your EduNexus project root:

```bash
# .env
VITE_SUPABASE_URL=https://abc123def.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Important:** Add `.env` to `.gitignore` — never commit API keys!

---

## 1.3 Run Database Migrations

### Method A: Via Supabase SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Run these files **in order** by copying their contents:

```sql
-- 1. Run: supabase/migrations/001_initial_schema.sql
--    Creates: schools, profiles, students, teachers, attendance,
--             fee_records, exam_schedules, exam_results, payroll,
--             timetable_periods, library_books, book_issues,
--             transport_routes, student_transport, hostel_blocks,
--             hostel_rooms, hostel_residents, notifications
--    Creates: custom ENUM types, indexes, triggers, views, RPC functions

-- 2. Run: supabase/migrations/002_rls_policies.sql
--    Enables: Row-Level Security on all tables
--    Creates: helper functions (auth_role, auth_school_id, etc.)
--    Defines: per-role access policies

-- 3. Run: supabase/migrations/003_seed_data.sql
--    Inserts: demo school, sample students, teachers, fees,
--             books, routes, hostel blocks, notifications

-- 4. Run: supabase/migrations/004_realtime.sql
--    Configures: realtime publication for notifications,
--                attendance, fee_records, students
--    Creates: dashboard_stats view
```

### Method B: Via Supabase CLI

```bash
# Install Supabase CLI
brew install supabase/tap/supabase    # macOS
npm install -g supabase               # cross-platform

# Login and link
supabase login
supabase link --project-ref abc123def

# Push migrations
supabase db push
```

---

## 1.4 Create Test Users

### Via Supabase Dashboard
1. Go to **Authentication → Users** → **"Add user"**
2. Create users with these emails:

| Email | Password | Role | School |
|-------|----------|------|--------|
| admin@edunexus.com | Pass@123 | super_admin | — |
| priya@springdale.edu | Pass@123 | school_admin | Springdale International |
| ravi@springdale.edu | Pass@123 | teacher | Springdale International |
| arjun@student.edu | Pass@123 | student | Springdale International |
| rajesh@gmail.com | Pass@123 | parent | Springdale International |
| sunita@springdale.edu | Pass@123 | accountant | Springdale International |
| anita@springdale.edu | Pass@123 | hr | Springdale International |
| ramesh@springdale.edu | Pass@123 | librarian | Springdale International |
| mohan@springdale.edu | Pass@123 | transport_manager | Springdale International |

3. For each user, go to **Table Editor → profiles** and verify the role is set

### Via SQL

```sql
-- Create auth users + profiles in one step
SELECT supabase_admin.create_user(
  '{
    "email": "admin@edunexus.com",
    "password": "Pass@123",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Vikram Oberoi",
      "role": "super_admin"
    }
  }'::jsonb
);
-- Repeat for each role...
```

---

## 1.5 Enable Auth Settings

1. Go to **Authentication → Settings**
2. **Site URL:** `http://localhost:5173`
3. **Redirect URLs:** `http://localhost:5173/**`
4. Disable **"Confirm email"** for development (reenable for production)
5. Save

---

## 1.6 Connect Frontend

The frontend already has the Supabase client at `src/lib/supabase.ts`. It auto-detects when env vars are present.

### Switch from Demo to Supabase Mode

Update `src/store/useAppStore.ts`:

```typescript
// ADD BACK Supabase login support
import { authService } from '../services/authService'
import { isSupabaseConfigured } from '../lib/supabase'
import { toast } from 'sonner'

// Inside the store:
loginWithSupabase: async (email: string, password: string) => {
  set({ isLoadingAuth: true })
  const { data, error } = await authService.signIn(email, password)
  if (error || !data?.user) {
    toast.error(error?.message || 'Login failed')
    set({ isLoadingAuth: false })
    return false
  }
  const { data: profile } = await authService.getProfile(data.user.id)
  const user: User = {
    id: data.user.id,
    name: (profile as any)?.full_name || data.user.email || 'User',
    email: data.user.email || '',
    role: ((profile as any)?.role as UserRole) || 'school_admin',
    school: (profile as any)?.schools?.name || undefined,
  }
  set({ user, isAuthenticated: true, isLoadingAuth: false })
  return true
},

logout: async () => {
  if (isSupabaseConfigured) await authService.signOut()
  set({ user: null, isAuthenticated: false })
},
```

Then update `src/pages/LoginPage.tsx` to restore the Supabase tab.

> See **Frontend Wiring Guide** section at the bottom for full details.

---

## 1.7 Realtime Configuration

Supabase Realtime is already configured via `004_realtime.sql`:

```sql
-- Tables enabled for realtime:
--   notifications  → instant push to user bell icon
--   attendance     → live attendance updates
--   fee_records    → payment status changes
--   students       → roster updates
```

The frontend hooks are ready:
- `useRealtimeNotifications()` — pushes new DB inserts into notification bell
- `useRealtimeChannel(table, filter)` — generic subscription helper

### Usage in Frontend

```typescript
// In AppLayout or after login:
useRealtimeNotifications()

// In AttendancePage:
const channel = attendanceService.subscribeToDate(date, schoolId, (payload) => {
  // Update local state when another teacher marks attendance
})
```

---

## 1.8 Storage (File Uploads)

### Create Buckets

```sql
-- Via SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('logos', 'logos', true);
```

### Storage Policies

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view public avatars
CREATE POLICY "Public avatars are viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

---

## 1.9 Edge Functions (Serverless APIs)

### Example: Send Welcome Email

```bash
# Create edge function
supabase functions new send-welcome-email
```

```typescript
// supabase/functions/send-welcome-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', userId).single()
  // Send email via SendGrid, Resend, etc.
  return new Response(JSON.stringify({ sent: true }))
})
```

Deploy:
```bash
supabase functions deploy send-welcome-email
```

---

## 1.10 Production Checklist

- [ ] Enable **Row-Level Security** on all tables (verify via Supabase dashboard)
- [ ] Set strong database password
- [ ] Enable email confirmation in Auth settings
- [ ] Configure custom SMTP for emails
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in deployment env
- [ ] Add CORS origins for production domain
- [ ] Enable Point-in-Time Recovery for database
- [ ] Set rate limiting for Auth endpoints
- [ ] Monitor usage in Supabase dashboard

---

# Option 2: Spring Boot (Java)

> **Enterprise-grade Java backend.** Full REST API, JWT authentication, PostgreSQL/MySQL, scalable.  
> **Time to deploy:** ~2–4 hours  
> **Cost:** Self-hosted or AWS/Azure/GCP

---

## 2.1 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Spring Boot | 3.2.x |
| **Language** | Java | 21 (LTS) |
| **Build Tool** | Maven or Gradle | — |
| **Database** | PostgreSQL | 16 |
| **Auth** | Spring Security + JWT (jjwt) | 0.12.x |
| **ORM** | Spring Data JPA + Hibernate | 6.x |
| **Validation** | Jakarta Bean Validation | 3.x |
| **API Docs** | Springdoc OpenAPI (Swagger) | 2.x |
| **Caching** | Redis (optional) | — |
| **Real-time** | WebSocket (optional) | — |

---

## 2.2 Project Setup

### Initialize Project

**Via Spring Initializr (https://start.spring.io):**

```
Project:    Maven
Language:   Java
Spring Boot: 3.2.x
Group:      com.edunexus
Artifact:   erp-backend
Name:       edunexus-erp-backend
Packaging:  Jar
Java:       21

Dependencies:
  ✅ Spring Web
  ✅ Spring Security
  ✅ Spring Data JPA
  ✅ PostgreSQL Driver
  ✅ Lombok
  ✅ Validation
  ✅ Spring Boot DevTools
  ✅ Springdoc OpenAPI
```

Click **Generate** → download → extract.

### Project Structure

```
edunexus-erp-backend/
├── src/main/java/com/edunexus/erp/
│   ├── EduNexusErpApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java           ← JWT filter chain
│   │   ├── CorsConfig.java               ← CORS for frontend
│   │   └── OpenApiConfig.java            ← Swagger config
│   ├── security/
│   │   ├── JwtService.java               ← Token generation/validation
│   │   ├── JwtAuthFilter.java            ← OncePerRequestFilter
│   │   └── UserDetailsServiceImpl.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── StudentController.java
│   │   ├── TeacherController.java
│   │   ├── AttendanceController.java
│   │   ├── FeeController.java
│   │   ├── ExamController.java
│   │   ├── PayrollController.java
│   │   ├── TimetableController.java
│   │   ├── LibraryController.java
│   │   ├── HostelController.java
│   │   ├── TransportController.java
│   │   ├── NotificationController.java
│   │   └── DashboardController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── StudentService.java
│   │   ├── ... (one per module)
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── StudentRepository.java
│   │   ├── ... (Spring Data JPA repos)
│   ├── model/
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Student.java
│   │   │   ├── Teacher.java
│   │   │   ├── Attendance.java
│   │   │   ├── FeeRecord.java
│   │   │   ├── ExamSchedule.java
│   │   │   ├── ExamResult.java
│   │   │   ├── Payroll.java
│   │   │   ├── TimetablePeriod.java
│   │   │   ├── LibraryBook.java
│   │   │   ├── BookIssue.java
│   │   │   ├── TransportRoute.java
│   │   │   ├── HostelBlock.java
│   │   │   ├── Notification.java
│   │   │   └── School.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── LoginResponse.java
│   │   │   ├── StudentDTO.java
│   │   │   └── ... (request/response DTOs)
│   │   └── enums/
│   │       ├── UserRole.java
│   │       ├── StudentStatus.java
│   │       └── ... (Java enums matching DB)
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── ResourceNotFoundException.java
│
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/                    ← Flyway migrations
│       ├── V1__initial_schema.sql
│       └── V2__seed_data.sql
│
└── pom.xml
```

---

## 2.3 Database Schema (PostgreSQL)

The schema mirrors the Supabase migration. Key differences for Spring Boot:

```sql
-- V1__initial_schema.sql
-- Run with Flyway or manually

-- Users table (replaces Supabase auth.users + profiles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'super_admin','school_admin','teacher','student',
        'parent','accountant','hr','librarian','transport_manager'
    )),
    school_id UUID REFERENCES schools(id),
    phone VARCHAR(20),
    avatar_url TEXT,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ... (all other tables identical to Supabase migration)
-- Replace UUID generation: uuid_generate_v4() → gen_random_uuid()
-- Replace auth.uid() → user context from JWT
```

> **Full schema:** Copy the 15+ tables from `supabase/migrations/001_initial_schema.sql`, adapting UUID generation syntax.

---

## 2.4 Core Implementation

### application.yml

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/edunexus_erp
    username: postgres
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate  # Use Flyway for migrations
    show-sql: false
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration

app:
  jwt:
    secret: ${JWT_SECRET}  # 256-bit key, never commit!
    expiration-ms: 86400000  # 24 hours
  cors:
    allowed-origins: http://localhost:5173
```

### SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthFilter jwtAuthFilter
    ) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfig()))
            .sessionManagement(sm -> sm
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // Role-based access
                .requestMatchers("/api/admin/**")
                    .hasAnyRole("SUPER_ADMIN", "SCHOOL_ADMIN")

                .requestMatchers("/api/students/**")
                    .hasAnyRole("SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER")

                .requestMatchers("/api/teachers/**")
                    .hasAnyRole("SUPER_ADMIN", "SCHOOL_ADMIN")

                .requestMatchers("/api/attendance/**")
                    .hasAnyRole("SUPER_ADMIN", "SCHOOL_ADMIN",
                                "TEACHER", "STUDENT", "PARENT")

                .requestMatchers("/api/fees/**")
                    .hasAnyRole("SUPER_ADMIN", "SCHOOL_ADMIN",
                                "ACCOUNTANT", "STUDENT", "PARENT")

                .requestMatchers("/api/payroll/**")
                    .hasAnyRole("SUPER_ADMIN", "SCHOOL_ADMIN",
                                "ACCOUNTANT", "HR")

                // ... (all other route patterns)

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private CorsConfigurationSource corsConfig() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### JwtService.java

```java
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    public String generateToken(UserDetails userDetails, String userId, String role) {
        return Jwts.builder()
            .subject(userDetails.getUsername())
            .claim("userId", userId)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public boolean isValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isExpired(token);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ... helper methods
}
```

### JwtAuthFilter.java

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                authToken.setDetails(new WebAuthenticationDetailsSource()
                    .buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

---

## 2.5 JPA Entity Example

```java
// Student.java
@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(name = "roll_no", nullable = false)
    private String rollNo;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String classVal;  // "class" is reserved in Java

    @Column(nullable = false)
    private String section;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    private String phone;
    private String email;
    private String address;

    @Column(name = "parent_name")
    private String parentName;

    @Column(name = "parent_phone")
    private String parentPhone;

    @Column(name = "parent_email")
    private String parentEmail;

    @Column(name = "admission_date", nullable = false)
    private LocalDate admissionDate;

    @Enumerated(EnumType.STRING)
    private StudentStatus status;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
```

---

## 2.6 REST Controller Example

```java
// StudentController.java
@RestController
@RequestMapping("/api/students")
@Tag(name = "Students", description = "Student management endpoints")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','SCHOOL_ADMIN','TEACHER')")
    public ResponseEntity<Page<StudentDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String classVal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        // Scope: teachers see only their class students
        Page<StudentDTO> result = studentService.getAll(
            search, status, classVal, page, size, userDetails
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(studentService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<StudentDTO> create(
            @Valid @RequestBody StudentCreateDTO dto
    ) {
        StudentDTO created = studentService.create(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<StudentDTO> update(
            @PathVariable UUID id,
            @Valid @RequestBody StudentUpdateDTO dto
    ) {
        return ResponseEntity.ok(studentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 2.7 Full API Endpoint Reference

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `POST` | `/api/auth/login` | Public | Login → returns JWT |
| `POST` | `/api/auth/register` | Public | Register new user |
| `GET`  | `/api/auth/me` | All | Get current user profile |
| `GET`  | `/api/students` | Admin, Teacher | List students (paginated) |
| `GET`  | `/api/students/{id}` | Admin, Teacher, Student (own), Parent (child) | Get student |
| `POST` | `/api/students` | Admin | Create student |
| `PUT`  | `/api/students/{id}` | Admin | Update student |
| `DELETE` | `/api/students/{id}` | Admin | Delete student |
| `GET`  | `/api/teachers` | Admin | List teachers |
| `POST` | `/api/teachers` | Admin | Create teacher |
| `PUT`  | `/api/teachers/{id}` | Admin | Update teacher |
| `GET`  | `/api/attendance` | Admin, Teacher, Student, Parent | Get attendance |
| `POST` | `/api/attendance/bulk` | Admin, Teacher | Mark attendance |
| `GET`  | `/api/attendance/summary/{studentId}` | All | Attendance summary |
| `GET`  | `/api/fees` | Finance, Student, Parent | List fee records |
| `POST` | `/api/fees` | Finance | Create fee record |
| `PUT`  | `/api/fees/{id}/pay` | Finance | Mark fee as paid |
| `GET`  | `/api/fees/stats` | Finance | Fee collection stats |
| `GET`  | `/api/exams` | Admin, Teacher, Student, Parent | List exams |
| `POST` | `/api/exams` | Admin, Teacher | Create exam |
| `GET`  | `/api/exams/results` | Admin, Teacher, Student, Parent | Exam results |
| `GET`  | `/api/payroll` | Admin, Accountant, HR | Payroll records |
| `POST` | `/api/payroll/run` | Admin | Run payroll |
| `GET`  | `/api/timetable` | All | Get timetable |
| `GET`  | `/api/library/books` | All | List books |
| `POST` | `/api/library/books` | Librarian, Admin | Add book |
| `POST` | `/api/library/issue` | Librarian, Admin | Issue book |
| `GET`  | `/api/notifications` | All | Get notifications |
| `PUT`  | `/api/notifications/{id}/read` | All | Mark read |
| `GET`  | `/api/dashboard/stats` | All | Dashboard KPIs |

---

## 2.8 Run Spring Boot

```bash
# Terminal 1: Start PostgreSQL
docker run -d --name postgres-erp \
  -e POSTGRES_DB=edunexus_erp \
  -e POSTGRES_PASSWORD=changeme \
  -p 5432:5432 postgres:16

# Terminal 2: Run Spring Boot
cd edunexus-erp-backend
./mvnw spring-boot:run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

---

## 2.9 Generate JWT Secret

```bash
# Generate a secure 256-bit key
openssl rand -base64 32
# Output example: dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGp3dA==
```

Add to `application.yml`:
```yaml
app:
  jwt:
    secret: dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGp3dA==
```

Or via environment variable:
```bash
export JWT_SECRET="dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGp3dA=="
```

---

# Option 3: Next.js (Full-stack)

> **React full-stack framework.** API routes, server components, built-in auth (NextAuth.js), serverless or self-hosted.  
> **Time to deploy:** ~1–2 hours  
> **Cost:** Free tier on Vercel (100 GB bandwidth, 1M function invocations)

---

## 3.1 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Next.js | 14.x (App Router) |
| **Language** | TypeScript | 5.x |
| **Database** | PostgreSQL (via Prisma) | **OR** MongoDB (via Mongoose) |
| **ORM** | Prisma | 5.x |
| **Auth** | NextAuth.js (Auth.js) | 5.x |
| **Validation** | Zod | 3.x |
| **API** | Next.js API Routes / Server Actions | — |
| **Real-time** | Pusher / Socket.io / Supabase Realtime | — |
| **Email** | Resend / SendGrid | — |
| **Storage** | Vercel Blob / AWS S3 | — |

---

## 3.2 Project Setup

```bash
# Create Next.js app
npx create-next-app@latest edunexus-erp-next \
  --typescript --tailwind --eslint --app --src-dir

cd edunexus-erp-next

# Install dependencies
npm install next-auth@beta @prisma/client zod bcryptjs
npm install -D prisma @types/bcryptjs

# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql
```

### Project Structure

```
edunexus-erp-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    ← Root layout
│   │   ├── page.tsx                      ← Landing / redirect
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx              ← Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                ← Dashboard layout (auth check)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx              ← Dashboard page
│   │   │   ├── students/
│   │   │   │   └── page.tsx              ← Students page
│   │   │   ├── teachers/
│   │   │   │   └── page.tsx
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx
│   │   │   ├── fees/
│   │   │   │   └── page.tsx
│   │   │   ├── exams/
│   │   │   │   └── page.tsx
│   │   │   ├── payroll/
│   │   │   │   └── page.tsx
│   │   │   ├── timetable/
│   │   │   │   └── page.tsx
│   │   │   ├── library/
│   │   │   │   └── page.tsx
│   │   │   ├── hostel/
│   │   │   │   └── page.tsx
│   │   │   ├── transport/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts         ← NextAuth handler
│   │       ├── students/
│   │       │   ├── route.ts             ← GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts         ← GET, PUT, DELETE
│   │       ├── teachers/
│   │       │   └── route.ts
│   │       ├── attendance/
│   │       │   └── route.ts
│   │       ├── fees/
│   │       │   └── route.ts
│   │       ├── exams/
│   │       │   └── route.ts
│   │       ├── payroll/
│   │       │   └── route.ts
│   │       ├── timetable/
│   │       │   └── route.ts
│   │       ├── library/
│   │       │   └── route.ts
│   │       └── notifications/
│   │           └── route.ts
│   ├── lib/
│   │   ├── prisma.ts                     ← Prisma client singleton
│   │   ├── auth.ts                       ← NextAuth config
│   │   └── permissions.ts               ← RBAC config (same as frontend)
│   ├── types/
│   │   └── index.ts                     ← Shared TypeScript types
│   └── middleware.ts                     ← Route protection + RBAC
│
├── prisma/
│   └── schema.prisma                    ← Database schema
│
├── .env                                 ← Environment variables
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 3.3 Database Schema (Prisma)

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  SUPER_ADMIN   @map("super_admin")
  SCHOOL_ADMIN  @map("school_admin")
  TEACHER       @map("teacher")
  STUDENT       @map("student")
  PARENT        @map("parent")
  ACCOUNTANT    @map("accountant")
  HR            @map("hr")
  LIBRARIAN     @map("librarian")
  TRANSPORT_MANAGER @map("transport_manager")
}

model School {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  address   String?
  city      String?
  state     String?
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  students  Student[]
  teachers  Teacher[]
  feeRecords FeeRecord[]

  @@map("schools")
}

// User = combines auth.users + profiles
model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String   @unique
  passwordHash String   @map("password_hash")
  fullName     String   @map("full_name")
  role         UserRole
  schoolId     String?  @map("school_id") @db.Uuid
  school       School?  @relation(fields: [schoolId], references: [id])
  phone        String?
  avatarUrl    String?  @map("avatar_url")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  @@map("users")
}

model Student {
  id            String   @id @default(uuid()) @db.Uuid
  schoolId      String   @map("school_id") @db.Uuid
  school        School   @relation(fields: [schoolId], references: [id])
  rollNo        String   @map("roll_no")
  fullName      String   @map("full_name")
  class         String
  section       String
  gender        String
  dateOfBirth   DateTime @map("date_of_birth") @db.Date
  phone         String?
  email         String?
  address       String?
  parentName    String?  @map("parent_name")
  parentPhone   String?  @map("parent_phone")
  parentEmail   String?  @map("parent_email")
  admissionDate DateTime @default(now()) @map("admission_date") @db.Date
  status        String   @default("Active")
  avatarUrl     String?  @map("avatar_url")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  attendance    Attendance[]
  feeRecords    FeeRecord[]
  examResults   ExamResult[]

  @@unique([schoolId, rollNo, class, section])
  @@map("students")
}

model Teacher {
  id              String   @id @default(uuid()) @db.Uuid
  schoolId        String   @map("school_id") @db.Uuid
  school          School   @relation(fields: [schoolId], references: [id])
  employeeId      String   @map("employee_id")
  fullName        String   @map("full_name")
  department      String
  subject         String
  qualification   String
  experienceYears Int      @default(0) @map("experience_years")
  phone           String?
  email           String
  joinDate        DateTime @default(now()) @map("join_date") @db.Date
  salary          Decimal  @db.Decimal(12, 2)
  status          String   @default("Active")
  avatarUrl       String?  @map("avatar_url")
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  @@unique([schoolId, employeeId])
  @@map("teachers")
}

model Attendance {
  id        String   @id @default(uuid()) @db.Uuid
  schoolId  String   @map("school_id") @db.Uuid
  studentId String   @map("student_id") @db.Uuid
  student   Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  status    String
  markedBy  String?  @map("marked_by") @db.Uuid
  remarks   String?
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  @@unique([studentId, date])
  @@map("attendance")
}

model FeeRecord {
  id            String   @id @default(uuid()) @db.Uuid
  schoolId      String   @map("school_id") @db.Uuid
  school        School   @relation(fields: [schoolId], references: [id])
  studentId     String   @map("student_id") @db.Uuid
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  feeType       String   @map("fee_type")
  amount        Decimal  @db.Decimal(12, 2)
  paidAmount    Decimal  @default(0) @map("paid_amount") @db.Decimal(12, 2)
  dueDate       DateTime @map("due_date") @db.Date
  paidDate      DateTime? @map("paid_date") @db.Date
  status        String   @default("Pending")
  paymentMethod String?  @map("payment_method")
  transactionId String?  @map("transaction_id")
  receiptNo     String?  @map("receipt_no")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  @@map("fee_records")
}

model ExamSchedule {
  id        String   @id @default(uuid()) @db.Uuid
  schoolId  String   @map("school_id") @db.Uuid
  subject   String
  class     String
  section   String
  examDate  DateTime @map("exam_date") @db.Date
  startTime String   @map("start_time")
  duration  Int      @default(180)
  maxMarks  Int      @default(100) @map("max_marks")
  examType  String   @map("exam_type")
  status    String   @default("Upcoming")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  @@map("exam_schedules")
}

model ExamResult {
  id            String       @id @default(uuid()) @db.Uuid
  studentId     String       @map("student_id") @db.Uuid
  student       Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  examScheduleId String      @map("exam_schedule_id") @db.Uuid
  examSchedule  ExamSchedule @relation(fields: [examScheduleId], references: [id])
  obtainedMarks Int          @map("obtained_marks")
  grade         String
  percentage    Decimal      @db.Decimal(5, 2)
  createdAt     DateTime     @default(now()) @map("created_at") @db.Timestamptz()

  @@map("exam_results")
}

model Payroll {
  id         String   @id @default(uuid()) @db.Uuid
  schoolId   String   @map("school_id") @db.Uuid
  teacherId  String   @map("teacher_id") @db.Uuid
  month      String
  year       Int
  grossSalary Decimal  @map("gross_salary") @db.Decimal(12, 2)
  pfDeduction Decimal  @map("pf_deduction") @db.Decimal(12, 2)
  taxDeduction Decimal @map("tax_deduction") @db.Decimal(12, 2)
  otherDeductions Decimal @default(0) @map("other_deductions") @db.Decimal(12, 2)
  netSalary  Decimal  @map("net_salary") @db.Decimal(12, 2)
  status     String   @default("Pending")
  paidDate   DateTime? @map("paid_date") @db.Date
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz()

  @@unique([teacherId, month, year])
  @@map("payroll")
}

model LibraryBook {
  id        String   @id @default(uuid()) @db.Uuid
  schoolId  String   @map("school_id") @db.Uuid
  title     String
  author    String
  isbn      String?
  category  String
  copies    Int      @default(1)
  available Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  @@map("library_books")
}

model BookIssue {
  id        String   @id @default(uuid()) @db.Uuid
  bookId    String   @map("book_id") @db.Uuid
  book      LibraryBook @relation(fields: [bookId], references: [id])
  studentId String   @map("student_id") @db.Uuid
  student   Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  issueDate DateTime @default(now()) @map("issue_date") @db.Date
  dueDate   DateTime @map("due_date") @db.Date
  returnDate DateTime? @map("return_date") @db.Date
  status    String   @default("Active")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  @@map("book_issues")
}

model Notification {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String?  @map("user_id") @db.Uuid
  schoolId  String?  @map("school_id") @db.Uuid
  title     String
  message   String
  type      String   @default("info")
  read      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  @@map("notifications")
}
```

### Run Migration

```bash
# Set DATABASE_URL in .env
# DATABASE_URL="postgresql://postgres:password@localhost:5432/edunexus_erp"

npx prisma db push        # Push schema to DB
npx prisma generate       # Generate Prisma client
npx prisma db seed        # Seed demo data (optional)
```

---

## 3.4 NextAuth.js Configuration

### .env
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/edunexus_erp"
AUTH_SECRET="your-auth-secret-key-generate-via-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"
```

### src/lib/auth.ts

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          schoolId: user.schoolId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.schoolId = user.schoolId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.schoolId = token.schoolId
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
```

### src/app/api/auth/[...nextauth]/route.ts
```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

---

## 3.5 Middleware (Route Protection + RBAC)

### src/middleware.ts

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import type { NextRequest } from "next/server"

// Role-to-route permissions (mirrors frontend config)
const routePermissions: Record<string, string[]> = {
  "/dashboard":      ["*"],
  "/students":       ["super_admin", "school_admin", "teacher"],
  "/teachers":       ["super_admin", "school_admin"],
  "/attendance":     ["super_admin", "school_admin", "teacher", "student", "parent"],
  "/fees":           ["super_admin", "school_admin", "accountant", "student", "parent"],
  "/exams":          ["super_admin", "school_admin", "teacher", "student", "parent"],
  "/payroll":        ["super_admin", "school_admin", "accountant", "hr"],
  "/timetable":      ["super_admin", "school_admin", "teacher", "student", "parent"],
  "/library":        ["super_admin", "school_admin", "librarian", "teacher", "student"],
  "/hostel":         ["super_admin", "school_admin"],
  "/transport":      ["super_admin", "school_admin", "transport_manager"],
  "/analytics":      ["super_admin", "school_admin"],
  "/notifications":  ["*"],
  "/settings":       ["*"],
}

export default auth((req) => {
  const path = req.nextUrl.pathname
  const session = req.auth

  // Public routes
  if (path === "/login" || path.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Not authenticated → redirect to login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Find matching route permission
  const routeKey = Object.keys(routePermissions).find(k => path.startsWith(k))
  if (routeKey) {
    const allowed = routePermissions[routeKey]
    const role = session.user.role as string

    if (allowed !== "*" && !allowed.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

---

## 3.6 API Route Example

### src/app/api/students/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { z } from "zod"

// GET /api/students
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as string
  const schoolId = session.user.schoolId

  if (!hasPermission(role, "students")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status") || ""
  const classVal = searchParams.get("class") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

  const where: any = {}

  // Role-based scoping
  if (role === "teacher") {
    where.class = "10" // Teacher sees assigned class
  } else if (role === "student" || role === "parent") {
    where.id = session.user.id // Student sees own record only
  } else if (schoolId) {
    where.schoolId = schoolId
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { rollNo: { contains: search } },
    ]
  }
  if (status) where.status = status
  if (classVal) where.class = classVal

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { fullName: "asc" },
    }),
    prisma.student.count({ where }),
  ])

  return NextResponse.json({
    data: students,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

// POST /api/students
const createStudentSchema = z.object({
  fullName: z.string().min(2),
  rollNo: z.string().min(1),
  class: z.string(),
  section: z.string(),
  gender: z.enum(["Male", "Female"]),
  dateOfBirth: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as string
  if (!["super_admin", "school_admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const validated = createStudentSchema.parse(body)

  const student = await prisma.student.create({
    data: {
      ...validated,
      dateOfBirth: new Date(validated.dateOfBirth),
      schoolId: session.user.schoolId!,
      admissionDate: new Date(),
      status: "Active",
    },
  })

  return NextResponse.json(student, { status: 201 })
}
```

---

## 3.7 API Route for Each Module

Create similar route files for all modules:

| File | Methods | Purpose |
|------|---------|---------|
| `api/auth/[...nextauth]/route.ts` | GET, POST | NextAuth handler |
| `api/students/route.ts` | GET, POST | List, create students |
| `api/students/[id]/route.ts` | GET, PUT, DELETE | Single student CRUD |
| `api/teachers/route.ts` | GET, POST | Teachers |
| `api/attendance/route.ts` | GET, POST | Attendance (GET by date/class, POST bulk) |
| `api/fees/route.ts` | GET, POST | Fees |
| `api/fees/stats/route.ts` | GET | Fee stats |
| `api/exams/route.ts` | GET, POST | Exam schedules |
| `api/exams/results/route.ts` | GET, POST | Exam results |
| `api/payroll/route.ts` | GET, POST | Payroll |
| `api/timetable/route.ts` | GET | Timetable |
| `api/library/books/route.ts` | GET, POST | Books |
| `api/library/issues/route.ts` | GET, POST | Book issues |
| `api/notifications/route.ts` | GET | Notifications |
| `api/dashboard/stats/route.ts` | GET | Dashboard KPIs |

---

## 3.8 Run Next.js

```bash
# Terminal 1: Start PostgreSQL
docker run -d --name postgres-erp \
  -e POSTGRES_DB=edunexus_erp \
  -e POSTGRES_PASSWORD=changeme \
  -p 5432:5432 postgres:16

# Terminal 2: Run Next.js
npm run dev
# App at http://localhost:3000
# API at http://localhost:3000/api/*
```

---

## 3.9 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_URL, AUTH_SECRET, AUTH_URL
```

---

# Frontend Wiring Guide

> How to connect the existing EduNexus React frontend to any backend.

## Switch from Demo to API Mode

### 1. Create API Client

```typescript
// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

interface FetchOptions extends RequestInit {
  token?: string
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: (token: string) =>
    apiFetch<any>('/auth/me', { token }),
}

// Students API
export const studentsApi = {
  getAll: (params: Record<string, string>, token: string) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch<any>(`/students?${qs}`, { token })
  },
  getById: (id: string, token: string) =>
    apiFetch<any>(`/students/${id}`, { token }),
  create: (data: any, token: string) =>
    apiFetch<any>('/students', { method: 'POST', body: JSON.stringify(data), token }),
  update: (id: string, data: any, token: string) =>
    apiFetch<any>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  delete: (id: string, token: string) =>
    apiFetch<void>(`/students/${id}`, { method: 'DELETE', token }),
}

// ... repeat for all modules
```

### 2. Update Auth Store

```typescript
// src/store/useAppStore.ts — add API-based login
import { authApi } from '../lib/api'

loginWithApi: async (email: string, password: string) => {
  set({ isLoadingAuth: true })
  try {
    const { token, user } = await authApi.login(email, password)
    localStorage.setItem('auth_token', token)
    set({ user, isAuthenticated: true, isLoadingAuth: false })
    toast.success('Signed in successfully')
    return true
  } catch (err: any) {
    toast.error(err.message || 'Login failed')
    set({ isLoadingAuth: false })
    return false
  }
},

// On app load, restore token
initApiAuth: () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return
  authApi.getMe(token)
    .then(user => set({ user, isAuthenticated: true }))
    .catch(() => localStorage.removeItem('auth_token'))
},
```

### 3. Update Service Layer

Replace mock fallbacks with API calls:

```typescript
// src/services/studentService.ts — updated
import { studentsApi } from '../lib/api'

export const studentService = {
  async getAll(filters: StudentFilters = {}) {
    const token = localStorage.getItem('auth_token')
    if (!token) return { data: [], error: new Error('Not authenticated') }

    try {
      const result = await studentsApi.getAll(filters as any, token)
      return { data: result.data, error: null, count: result.total }
    } catch (err) {
      return { data: [], error: err }
    }
  },
  // ... all other methods
}
```

### 4. Re-enable Login Tabs

Restore the Supabase/API login tab in `LoginPage.tsx`:

```tsx
<div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6">
  <button onClick={() => setMode('api')} ...>🔑 Email Login</button>
  <button onClick={() => setMode('demo')} ...>⚡ Demo Mode</button>
</div>
```

### 5. Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:8080/api    # Spring Boot
# OR
VITE_API_URL=http://localhost:3000/api    # Next.js
# OR
VITE_SUPABASE_URL=https://xxx.supabase.co # Supabase
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

# Comparison Matrix

| Feature | Supabase | Spring Boot | Next.js |
|---------|----------|-------------|---------|
| **Type** | BaaS (Backend-as-a-Service) | Traditional REST API | Full-stack framework |
| **Setup time** | ~30 min | ~3 hours | ~1.5 hours |
| **Hosting** | Supabase Cloud (free tier) | AWS/GCP/Azure ($) | Vercel (free tier) |
| **Database** | PostgreSQL (managed) | PostgreSQL/MySQL (self-managed) | PostgreSQL via Prisma |
| **Auth** | Built-in (Supabase Auth) | Spring Security + JWT (manual) | NextAuth.js (semi-built-in) |
| **Real-time** | Built-in (WebSockets) | WebSocket (manual) | Pusher/Socket.io (external) |
| **RLS** | Built-in (PostgreSQL RLS) | Manual (@PreAuthorize) | Manual (middleware) |
| **API Docs** | Auto-generated | Swagger/OpenAPI | None built-in |
| **Edge Functions** | Deno (built-in) | N/A | Vercel Edge / Serverless |
| **Scalability** | Auto-scaling | Manual (K8s, load balancer) | Serverless auto-scale |
| **Learning curve** | Low | High (Java/Spring ecosystem) | Medium (React ecosystem) |
| **Best for** | Rapid prototyping, startups | Enterprise, large teams | Full-stack JS/TS teams |
| **Cold start** | None (always warm) | None (always running) | ~500ms (serverless) |
| **Multi-tenancy** | School-level RLS | Service-layer | Middleware + Prisma |
| **File storage** | Built-in (S3-compatible) | External (S3/MinIO) | Vercel Blob / S3 |
| **Email** | Built-in templates | External (SendGrid, etc.) | Resend / SendGrid |
| **Monitoring** | Built-in dashboard | Prometheus/Grafana | Vercel Analytics |

---

## ⚡ Quick Decision Guide

```
Are you a JavaScript/TypeScript team?
  YES → Are you comfortable managing infrastructure?
    YES → Next.js (full control, serverless)
    NO  → Supabase (zero ops, fastest setup)

Are you a Java/enterprise team?
  YES → Spring Boot (industry standard, maximum control)

Need real-time features (live attendance, instant notifications)?
  → Supabase (built-in WebSockets — easiest)
  → Spring Boot + WebSocket (most control)
  → Next.js + Pusher (best developer experience)

Budget = $0?
  → Supabase (free tier: 2 projects, 500 MB)
  → Next.js on Vercel (free tier: 100 GB bandwidth)
  → Spring Boot (self-host on free cloud tiers)

Need RLS (row-level security) out of the box?
  → Supabase (PostgreSQL RLS policies)
  → Others require manual implementation
```

---

<div align="center">

**Choose the backend that fits your team and scale.**

*All three options are fully compatible with the EduNexus React frontend.*

</div>
