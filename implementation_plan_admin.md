# Updated Implementation Plan: Admin Seeding UI & Step 1 Department 

Based on your request, we will skip the automated `seed.py` and build a dedicated Admin Interface for you to seed the data manually according to the university's exact guidelines.

## User Review Required

> [!WARNING]
> According to your `tpqa_schema.sql`, **every** Employee (including the Director) MUST have a `Department_ID` (`NOT NULL`). Therefore, when adding the Director, the backend will automatically create an "Administration" department to attach them to, unless you prefer explicitly typing a department name for the Director as well. Please confirm if creating an implicit "Administration" department for the Director is acceptable.
Response : YEs it is admissible as long as you sanitise in backend/frontend that only the director is part of this department.

## Proposed Changes 
Comment
 : Proceed, it is correct
### 1. Admin Authentication & Dashboard
- **Backend**: Create `POST /api/auth/login/admin` in `routers/auth.py` that bypasses normal auth and returns a JWT with `user_type: "ADMIN"` if the password is `"123976"`.
- **Frontend**: 
  - [NEW] `frontend/app/admin/page.tsx` for the admin login screen.
  - [NEW] `frontend/app/dashboard/admin/page.tsx` as the admin dashboard.
  - [MODIFY] `frontend/app/dashboard/layout.tsx` to handle the `ADMIN` role for the sidebar.

### 2. Admin Seeding Modals (Frontend)
Create two large glassmorphism forms in `frontend/app/dashboard/admin/page.tsx`:
- **Add Director Modal**: Captures Name, Email, Password, and Designation.
- **Add Department Bundle Modal**: A comprehensive form containing:
  - Department Name
  - **HOD Details**: Name, Email, Password, Designation
  - **Project Coordinator Details**: Name, Email, Password, Designation
  (All fields will be mandatory to ensure a perfect state for the 9-step workflow).

### 3. Admin Seeding Endpoints (Backend)
- [NEW] `POST /api/admin/director`: Creates the "Administration" department (if it doesn't exist) and creates the Director employee.
- [NEW] `POST /api/admin/department-bundle`: 
  1. Creates the `Department`.
  2. Creates the HOD Employee with the `HOD` Role.
  3. Creates the Coordinator Employee with the `PROJECT_COORDINATOR` Role.
  4. Updates the new Department's `HOD_Employee_ID` to lock in the foreign key mapping.

### 4. Step 1 Logical Resolution
- **Backend (`schemas/project.py` & `step_1_request.py`)**: 
  - [MODIFY] Add `Department_ID` to the `ProjectCreate` Pydantic schema.
  - [MODIFY] When Step 1 runs, set the project's `Department_ID` to what the organization requested, and set the project's `Coordinator_ID` to that specific Department's `HOD_Employee_ID` as the interim coordinator.
- **Frontend (`StepModals.tsx`)**: 
  - [MODIFY] `CreateRequestModal` will hit `/api/consultancy/departments` and render a dropdown to force the external organization to select an existing engineering department.

## Verification
- We will login to `/admin` using "123976".
- We will use the portals to create the IT Department (with an HOD and Coordinator).
- We will log in as a Client and successfully create a Request by selecting the IT Department from the dropdown.
