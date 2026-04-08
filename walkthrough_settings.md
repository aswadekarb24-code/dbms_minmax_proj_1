# Walkthrough: Profile Settings & Avatar

In this stage, we have fully implemented the user avatars and the authenticated settings mutation API. Here's a summary of the accomplishments:

## 1. Database & Schema Expansion
- **Profile_URL**: A new `profile_url` string column has been gracefully added to the `Employee` SQLAlchemy model in `backend/models/tables.py`. Optional during signup, it now correctly caches links directly mapped to users.
- **Strict Validation**: The API now fully integrates the `FacultySettingsUpdate` schema within `backend/schemas/auth.py`, strictly demanding `old_password` authorization.

## 2. Dynamic Update Endpoint
We securely mounted:
- `PUT /api/auth/faculty/settings` within `auth.py`. 
- **Security Scope**: This strictly requires the user to be categorized under the `COLLEGE_OFFICIAL` header (using the `get_current_user` dependency).
- It verifies the `old_password` string through Argon2 hashes and modifies `Full_Name`, `Profile_URL`, or cascades a `new_password`.

## 3. Top-bar Avatar UI
The platform layout (`frontend/app/dashboard/layout.tsx`) header received dynamic UI.
- Instead of static generic elements, a highly aesthetic `<img />` avatar is generated directly using your fetched settings `user.Profile_URL`.
- If a user lacks an image locally, it intelligently handles missing or broken links by hooking `onError` event listeners and seamlessly deploying a generic Lucide fallback icon (`User`).

## 4. State Binding & Recontextualization
A new global `updateUser` bridge has been exposed in `frontend/lib/auth-context.tsx`. 
- After submitting changes to `SettingsModal`, it instantly re-syncs Next.js localized states, rendering updates sequentially without forcing a page refresh!

## 5. Visual Preview
> **Avatar Button** triggers a clean, glassmorphic Setting Panel housing protected input credentials, exactly mapping out visual enhancements requested during step 5 of the design schema. Optionally, the profile URL is natively allowed to be attached during a user's initial Faculty Registration journey on `/signup/faculty`.
