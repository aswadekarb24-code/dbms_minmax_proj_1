# Implementation Plan: Faculty Profile Settings & Avatar

## 1. Backend Updates

### A. Database Model & Schema
- **File:** `backend/models/tables.py`
  - Ensure the `Employee` model maps the new column: `Profile_URL = Column(String(255), nullable=True)`.
- **File:** `backend/schemas/auth.py`
  - Update `FacultySignup`: Add `profile_url: Optional[str] = None`.
  - Update `EmployeeResponse`: Add `Profile_URL: Optional[str] = None`.
  - Create a new schema `FacultySettingsUpdate`:
    - `old_password: str` (Required for authorization).
    - `name: Optional[str] = None`.
    - `profile_url: Optional[str] = None`.
    - `new_password: Optional[str] = None`.

### B. Route Endpoints
- **File:** `backend/routers/auth.py`
  - **Signup Update:** Modify `signup_faculty` to accept and insert the `profile_url` field into the database.
  - **New Endpoint:** `PUT /api/auth/faculty/settings`
    - Apply `Depends(get_current_user)` to secure the route.
    - Verify that `current_user["user_type"] == "COLLEGE_OFFICIAL"`.
    - Verify `old_password` matches the stored hash for the user.
    - If valid, dynamically update `Full_Name`, `Profile_URL`, and `Auth_Hash` (if `new_password` is provided).
    - Commit changes and return updated user object.

## 2. Frontend Updates

### A. Context & API Wrapper
- **File:** `frontend/lib/auth-context.tsx`
  - Update the `AuthUser` interface to include `Profile_URL?: string`.
  - Add functionality to refresh user context locally (or re-login silently) if the settings are updated.

### B. UI Components
- **File:** `frontend/app/dashboard/layout.tsx`
  - **Top Bar Avatar:** In the header area (top right), replace or accompany the static UI with an `<img />` tag.
    - Logic: `src={user.Profile_URL || "/default-avatar.png"}`, with a fallback `onError` handler or generic fallback icon (like a `User` Lucide icon) to ensure it renders a default avatar when the DB returns NULL or an invalid link.
  - Add an `onClick` listener to the avatar that opens the new `SettingsModal`.

- **File:** `frontend/components/modals/SettingsModal.tsx` (New Component)
  - Create a modal containing:
    - **Current Values:** Pre-populated Name and Profile URL.
    - **Inputs:** Name, Profile URL, New Password (Optional).
    - **Required Input:** Current Password.
  - Handles the `PUT` API request, renders validation errors (e.g., "Invalid old password"), and forces a session refresh or re-login on success to apply updates safely.

### C. Signup Flow
- **File:** `frontend/app/signup/page.tsx` (or where the faculty signup form renders)
  - Add an optional text input block for "Profile URL".

## Execution Strategy
1. The backend model and schemas are updated first so that new values can flow in from frontend endpoints safely.
2. We then wire up the new backend `PUT` endpoint with strict dependency checks and password verification logic.
3. We update the frontend global state (`AuthUser`), which natively dictates the layout avatar.
4. We build the dropdown/modal trigger from the top right avatar, constructing the stateful settings form.
5. Everything connects gracefully with zero disruptions to the core consultancy steps or external clients.
