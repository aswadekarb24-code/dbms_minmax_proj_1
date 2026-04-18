# TPQA Management System

**Academic Consultancy & Third-Party Quality Audit Management Platform**

A full-stack web application for managing the complete lifecycle of academic consultancy projects — from initial client request through to revenue distribution — built for engineering university departments.

---

## Architecture Overview

```
dbms_minmax_proj_1/
├── tpqa_schema.sql          # PostgreSQL DDL (Supabase-compatible, idempotent)
├── backend/                 # FastAPI + SQLAlchemy backend
│   ├── main.py              # App entry point, CORS, router mounts
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variable template
│   ├── core/
│   │   ├── config.py        # Pydantic Settings (reads .env)
│   │   ├── database.py      # SQLAlchemy engine + session factory
│   │   └── security.py      # Bcrypt hashing, JWT create/verify
│   ├── models/
│   │   └── tables.py        # 11 SQLAlchemy ORM models
│   ├── schemas/
│   │   ├── auth.py          # Pydantic models for auth requests/responses
│   │   └── project.py       # Pydantic models for project CRUD
│   ├── routers/
│   │   ├── auth.py          # /api/auth/* endpoints
│   │   └── consultancy.py   # /api/consultancy/* (9-step workflow + data)
│   ├── deps.py              # Dependency injection (JWT validation)
│   └── tests/
│       ├── conftest.py      # SQLite test DB, fixtures, token helpers
│       ├── test_auth.py     # Auth endpoint tests
│       ├── test_consultancy.py  # Workflow tests
│       └── test_errors.py   # Error code coverage (401, 403, 404, 422, 405)
└── frontend/                # Next.js 16 + TailwindCSS 4
    ├── app/
    │   ├── login/
    │   │   ├── page.tsx         # Login landing (choose Faculty or Client)
    │   │   ├── faculty/page.tsx # Faculty login form
    │   │   └── client/page.tsx  # Client login form
    │   ├── signup/
    │   │   ├── page.tsx         # Signup landing
    │   │   ├── faculty/page.tsx # Faculty registration
    │   │   └── client/page.tsx  # Client/Org registration
    │   └── dashboard/
    │       ├── layout.tsx       # Sidebar + protected route wrapper
    │       ├── college/page.tsx # Faculty dashboard
    │       ├── organization/page.tsx # Client dashboard
    │       └── projects/[id]/page.tsx # Project detail + workflow
    ├── components/
    │   ├── ui/StepIndicator.tsx     # 9-step visual progress bar
    │   └── workflow/WorkflowContainer.tsx # Dynamic form for each step
    └── lib/
        ├── api.ts           # Axios client with JWT interceptors
        ├── auth-context.tsx  # React context for auth state
        └── types.ts         # TypeScript types matching DB schema
```

---

## Database Schema

The PostgreSQL schema (`tpqa_schema.sql`) contains:

- **11 Tables**: Roles, Departments, Employees, Clients, External_Agencies, Projects, Budget_Estimations, Invoices, Receipts, Distribution_Master, Distribution_Line_Items
- **4 Custom ENUMs**: `project_status`, `invoice_type`, `payee_type`, `distribution_approval_status`
- **2 Analytics Views**: `View_Institute_Cumulative_Revenue`, `View_Project_Coordinator_Analytics`
- **Auto-update triggers** on `Updated_At` columns for all tables
- **Idempotent**: Starts with `DROP IF EXISTS CASCADE` so it can be re-run safely

### Authentication Columns
- `Employees.Email` (UNIQUE) + `Employees.Auth_Hash` — faculty login
- `Clients.Contact_Email` (UNIQUE) + `Clients.Auth_Hash` — client login

---

## 9-Step Consultancy Workflow

| Step | Status Enum | Action | Who |
|------|------------|--------|-----|
| 1 | `REQUEST_BY_EXTERNAL_ORG` | Organization submits consultancy request | Client |
| 2 | `RESPONSE_BY_FACULTY` | Faculty assigns coordinator, proposes budget | Faculty |
| 3 | `AGENCY_ACCEPTANCE` | Client accepts proposed fee structure | Client |
| 4 | `DIRECTOR_APPROVAL` | Director reviews and approves budget | Director |
| 5 | `PROFORMA_INVOICE` | Generate proforma invoice | Faculty |
| 6 | `TAX_INVOICE_AND_RECEIPT` | Issue tax invoice, record payment receipt | Faculty |
| 7 | `COMPLETION_REPORTS` | Upload completion reports to client | Faculty |
| 8 | `AMOUNT_DISTRIBUTION` | Execute 70/30 revenue distribution | Faculty |
| 9 | `CLOSED` | Project sealed and archived | System |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup/faculty` | Register faculty member |
| POST | `/api/auth/signup/client` | Register client organization |
| POST | `/api/auth/login/faculty` | Faculty login (returns JWT) |
| POST | `/api/auth/login/client` | Client login (returns JWT) |

### Consultancy (Protected — requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/consultancy/projects` | List projects (role-filtered) |
| GET | `/api/consultancy/projects/{id}` | Get project details |
| POST | `/api/consultancy/request` | Step 1: Create request |
| POST | `/api/consultancy/{id}/faculty-response` | Step 2: Faculty response |
| POST | `/api/consultancy/{id}/agency-acceptance` | Step 3: Agency acceptance |
| POST | `/api/consultancy/{id}/director-approval` | Step 4: Director approval |
| POST | `/api/consultancy/{id}/proforma-invoice` | Step 5: Proforma invoice |
| POST | `/api/consultancy/{id}/tax-invoice-receipt` | Step 6: Tax invoice + receipt |
| POST | `/api/consultancy/{id}/completion-report` | Step 7: Completion report |
| POST | `/api/consultancy/{id}/distribution` | Step 8: Revenue distribution |
| POST | `/api/consultancy/{id}/close` | Step 9: Close project |

### Reference Data
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/consultancy/departments` | No | List departments |
| GET | `/api/consultancy/roles` | No | List roles |
| GET | `/api/consultancy/employees` | Yes | List employees |
| GET | `/api/health` | No | Health check |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Database** | PostgreSQL (Supabase) | — |
| **Backend** | FastAPI | 0.115.12 |
| **ORM** | SQLAlchemy | 2.0.40 |
| **Auth** | python-jose (JWT) + passlib (Bcrypt) | — |
| **Frontend** | Next.js | 16.2.2 |
| **Styling** | TailwindCSS | 4.x |
| **HTTP Client** | Axios (patched) | 1.7.9 |
| **Testing** | Pytest + httpx | — |

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Supabase project (or any PostgreSQL instance)

### 1. Database Setup
1. Open your Supabase SQL Editor (or `psql`).
2. Paste and run the entire contents of `tpqa_schema.sql`.
3. Verify tables were created in the Table Editor.

### 2. Backend Setup
```bash
cd backend/

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase Postgres connection string and JWT secret

# Run the server
uvicorn main:app --reload
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Frontend Setup
```bash
cd frontend/

# Install dependencies
npm install

# Configure environment (already has default)
# Edit .env.local if backend is on a different URL

# Run dev server
npm run dev
# Available at http://localhost:3000
```

### 4. Running Tests
```bash
cd backend/
pytest tests/ -v --tb=short
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_DB_URL` | PostgreSQL connection string | `postgresql://postgres:pass@host:6543/postgres` |
| `JWT_SECRET` | Secret key for signing JWTs | `your-secure-random-string` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Token expiry in minutes | `1440` |
| `SUPABASE_DB_PASSWORD`| Supabase DB Password | `your-password` |
| `SUPABASE_REF` | Supabase Project Reference | `your-project-reference` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## User Roles & Access

| Role | Login Page | Dashboard | Permissions |
|------|-----------|-----------|-------------|
| **Director** | `/login/faculty` | `/dashboard/college` | Approve budgets (Step 4), view all projects |
| **HOD** | `/login/faculty` | `/dashboard/college` | Respond to requests (Step 2), view dept projects |
| **Project Coordinator** | `/login/faculty` | `/dashboard/college` | Full workflow management (Steps 2, 5-8) |
| **Support Staff** | `/login/faculty` | `/dashboard/college` | View projects |
| **Client/Organization** | `/login/client` | `/dashboard/organization` | Submit requests (Step 1), accept fees (Step 3) |

---

## Security

- **Password Hashing**: Bcrypt via Passlib
- **Token Authentication**: JWT (HS256) via python-jose
- **CORS**: Configured to allow only `http://localhost:3000`
- **Axios**: Pinned to v1.7.9 (patched for CVE-2025-27152)
- **DB Constraints**: `ON DELETE RESTRICT` on all financial foreign keys (immutable audit trail)
- **CHECK Constraints**: Distribution pool sum validation, invoice total validation

---

For a deep dive into the architecture, data strategy, and API specifications, please refer to [Project Report](Project_Report_TPQA.pdf). Detailed Documentation on [Drive](https://drive.google.com/drive/folders/1VvMn4G4r0XPNNq21LW2HyvIDxr0jT4ej?usp=sharing).

## License

Academic project — DBMS Semester Grade Project.
