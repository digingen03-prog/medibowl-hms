# Hospital Management System (HMS) - MVP 1.0

A production-quality, modular, lightweight, and secure Hospital Management System built strictly according to healthcare queue and consultation workflow standards.

Built with **Next.js (App Router)**, **NestJS (Modular Monolith)**, **PostgreSQL**, **Prisma ORM**, and **Tailwind CSS**.

---

## 🏥 Core Business Workflow

```mermaid
flowchart LR
    A["1. Receptionist Registers Patient"] --> B["2. Enters Waiting Queue (WAITING)"]
    B --> C["3. Doctor Views Queue"]
    C --> D["4. Doctor clicks CONSULTED"]
    D --> E["5. Forwarded to Doctor Assistant (CONSULTED)"]
    E --> F["6. Assistant Collects/Updates Fee"]
    F --> G["7. Assistant clicks SAVE & FINISH"]
    G --> H["8. Visit Completed (COMPLETED)"]
```

---

## 👥 Role-Based Dashboards & Capabilities

| Role | Dashboard URL | Key Capabilities |
|---|---|---|
| **Admin** | `/admin/dashboard` | Staff user management, doctor fee configuration, patient registry, visit audit, operational & revenue reports |
| **Receptionist** | `/receptionist/dashboard` | Patient registration, mobile duplicate warnings, queue assignment, real-time live waiting list |
| **Doctor** | `/doctor/dashboard` | Streamlined queue interface, live waiting counter, one-click **CONSULTED** action |
| **Doctor Assistant** | `/doctor-assistant/dashboard` | Consulted patient queue, fee adjustments, multi-method payment collection (Cash, UPI, Card), **SAVE & FINISH** |

---

## 🎨 UI/UX Design System (Enterprise Light Mode Only)

Strictly adheres to **Light Mode Only** (No dark elements anywhere):

- **Main Background**: `#F8FAFC` (Slate-50)
- **Card Background**: `#FFFFFF` (Pure White)
- **Primary Color**: `#2563EB` (Blue-600) / Hover: `#1D4ED8` (Blue-700)
- **Main Text**: `#0F172A` (Slate-900)
- **Secondary Text**: `#64748B` (Slate-500)
- **Border**: `#E2E8F0` (Slate-200)
- **Typography**: Inter / System Font with clear heading hierarchy

### Status Badge Color Tokens
- **WAITING**: Amber (`#D97706` text on `#FEF3C7` bg)
- **CONSULTED**: Blue (`#2563EB` text on `#DBEAFE` bg)
- **COMPLETED**: Green (`#16A34A` text on `#DCFCE7` bg)
- **CANCELLED**: Red (`#DC2626` text on `#FEE2E2` bg)

---

## 🔑 Demo User Accounts

All accounts share the default password: **`Password@123`**  
*(The `/login` screen also provides one-click quick login buttons for all roles)*

| Role | Email / Username | Default Password | Initial Description |
|---|---|---|---|
| **Admin** | `admin@hospital.com` | `Password@123` | System Administrator |
| **Receptionist** | `receptionist@hospital.com` | `Password@123` | Priya Sharma (Front Desk) |
| **Doctor** | `doctor@hospital.com` | `Password@123` | Dr. Sarah Jenkins (Cardiology, Fee: ₹500) |
| **Doctor** | `doctor2@hospital.com` | `Password@123` | Dr. Robert Chen (Orthopedics, Fee: ₹750) |
| **Doctor Assistant** | `assistant@hospital.com` | `Password@123` | Anjali Verma (Consultation Billing) |

---

## 🗄️ Relational Database Design (Prisma & PostgreSQL)

The system enforces strict relational integrity between **Patient** and **PatientVisit** entities:
- A patient can visit the hospital multiple times.
- Every visit generates an atomic concurrency-safe Visit Number (`VIS-2026-00001`) and daily sequential Queue Number (`#1, #2...`).
- Financial amounts use PostgreSQL `Decimal(10, 2)` to eliminate floating-point inaccuracies.
- Every state transition is recorded in an `AuditLog` table.

```mermaid
erDiagram
    User ||--o| Doctor : "has profile"
    User ||--o{ PatientVisit : "registers / consults"
    User ||--o{ Payment : "collects"
    Patient ||--o{ PatientVisit : "has visits"
    Doctor ||--o{ PatientVisit : "attends"
    PatientVisit ||--o| Consultation : "has fee record"
    Consultation ||--o{ Payment : "has payments"
    User ||--o{ AuditLog : "initiates"
```

---

## 🚀 Quickstart Guide (Local Development)

### 1. Prerequisites
- Node.js (v18+ or v26.x)
- PostgreSQL running on `localhost:5432` with a database named `hms_db`

### 2. Configure Environment

**Backend (`backend/.env`):**
```env
PORT=4000
DATABASE_URL="postgresql://postgres:12345@localhost:5432/hms_db?schema=public"
JWT_SECRET="hms_super_secret_jwt_key_2026_enterprise_secure"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:3000"
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Database Migration & Seeding
```bash
# In backend folder:
cd backend
npx prisma migrate dev
npm run seed
```

### 4. Running the Application

**Run Backend (Port 4000):**
```bash
cd backend
npm run build
node dist/src/main.js
# or for live watch mode:
npm run start:dev
```

**Run Frontend (Port 3001):**
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:3001`** in your browser.

---

## 🧪 Acceptance Testing (Section 17 Verification)

Run the automated test runner validating all 14 Acceptance Criteria:
```bash
node verify_acceptance_tests.mjs
```

### Verified Test Results
```text
=== STARTING HOSPITAL MANAGEMENT SYSTEM ACCEPTANCE TESTS ===

--- TEST 1: Admin Login & Create Role Accounts ---
✓ Admin authenticated successfully
✓ Receptionist created
✓ Doctor created (Fee: ₹650)
✓ Doctor Assistant created

--- TEST 2 & 3: Receptionist registers a new patient & visit ---
✓ Receptionist authenticated successfully
✓ Visit created! Visit Number: VIS-2026-00001, Queue Number: 1, Status: WAITING

--- TEST 4 & 5: Doctor views WAITING queue ---
✓ Doctor authenticated successfully
✓ Patient visible in Doctor's WAITING queue (Queue #1)

--- TEST 6: Doctor clicks Consulted ---
✓ Visit status transitioned to: CONSULTED

--- TEST 7: Patient appears in Doctor Assistant queue ---
✓ Doctor Assistant authenticated successfully
✓ Visit is visible in Assistant consulted list
✓ Patient successfully removed from waiting queue

--- TEST 8-12: Doctor Assistant collects fee and finishes visit ---
✓ Assistant opened details
✓ Finish Visit Response: Fee collection recorded and visit completed successfully!
✓ Is fully paid: true, Status: COMPLETED
✓ Completed visit cleanly removed from active assistant queue

--- TEST 13: Admin views completed visit and payment history ---
✓ Admin retrieved visit. Status: COMPLETED, Payments count: 1
✓ Payment: ₹700 via UPI
✓ Admin Dashboard Stats: Completed Visits: 1

--- TEST 14: Existing patient registers again; previous visit preserved ---
✓ Second visit created for existing patient
✓ Patient total visits in history: 2

🎉 ALL 14 ACCEPTANCE TESTS PASSED WITH 100% SUCCESS! 🎉
```

---

## 📁 Repository Structure

```
HMS/
├── backend/                  # NestJS Modular Monolith API
│   ├── prisma/
│   │   ├── schema.prisma     # Relational schema (User, Doctor, Patient, Visit, Payment...)
│   │   ├── migrations/       # Applied PostgreSQL migrations
│   │   └── seed.ts           # Demo users and doctors seed script
│   └── src/
│       ├── auth/             # JWT authentication, guards, roles decorator
│       ├── users/            # Admin user CRUD, status toggle, password reset
│       ├── doctors/          # Doctor profiles and default consultation fees
│       ├── patients/         # Patient registration, duplicate search by phone
│       ├── visits/           # Visit creation, concurrency-safe VIS-YYYY-XXXXX
│       ├── queue/            # Live waiting, consulted, and completed queues
│       ├── consultations/    # Doctor mark as CONSULTED atomic transition
│       ├── assistant/        # Doctor Assistant consulted queue & Save & Finish
│       ├── payments/         # Payment recording, payment methods (Cash, UPI, Card)
│       ├── admin/            # Admin dashboard metrics
│       ├── reports/          # Daily registrations, doctor caseloads, fee collections
│       ├── audit/            # Action audit trail logging
│       ├── common/           # SequenceService, guards, filters, decorators
│       ├── app.module.ts
│       └── main.ts
├── frontend/                 # Next.js App Router Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/        # Light-mode login with one-click demo selectors
│   │   │   ├── receptionist/ # Receptionist dashboard, register patient, queue, patients
│   │   │   ├── doctor/       # Doctor dashboard, waiting queue with CONSULTED action
│   │   │   ├── doctor-assistant/ # Consulted list, patient billing, SAVE & FINISH
│   │   │   └── admin/        # Admin dashboard, users, doctors, patients, visits, reports, settings
│   │   ├── components/       # Reusable UI components (Card, Button, StatusBadge, Modal, Sidebar...)
│   │   └── lib/              # API client, auth context, TypeScript definitions
├── docs/                     # Comprehensive documentation
│   ├── API_DOCUMENTATION.md  # Detailed REST API specification
│   ├── ACCEPTANCE_TESTING.md # Acceptance testing steps and checklist
│   └── DEPLOYMENT_GUIDE.md   # Production deployment and process management
├── verify_acceptance_tests.mjs # 14-point automated test script
├── package.json              # Monorepo task runner
└── README.md
```

