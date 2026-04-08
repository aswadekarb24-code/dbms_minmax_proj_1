# Task: Admin Seeding UI & Step 1 Enhancements

- [x] Backend: Admin Auth
  - [x] Add `POST /api/auth/login/admin` endpoint in `routers/auth.py` using static password '123976'.
- [x] Backend: Admin Seeding Endpoints
  - [x] Create `routers/admin.py` or add to `main.py`/`auth.py`. Since it's admin, we can create `backend/routers/admin.py`.
  - [x] Endpoints for `POST /api/admin/director` and `POST /api/admin/department-bundle`.
  - [x] Add sanitization: ensure no one else can be in the "Administration" department.
- [x] Frontend: Admin Pages & Navigation
  - [x] Create `frontend/app/admin/page.tsx` for admin login.
  - [x] Create `frontend/app/dashboard/admin/page.tsx` for adding Seed data.
  - [x] Add admin role to `frontend/app/dashboard/layout.tsx`.
- [x] Backend: Step 1 logical fix
  - [x] Update `schemas/project.py` to accept `Department_ID`.
  - [x] Update `step_1_request.py` to use selected `Department_ID` and fetch its HOD as interim coordinator.
- [x] Frontend: Step 1 logical fix
  - [x] Fetch departments and show dropdown in `StepModals.tsx` (`CreateRequestModal`).
  - [x] Exclude "Administration" department from the list.
