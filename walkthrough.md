# TPQA Platform Enhancement — Walkthrough

## Summary of Changes

Six major areas of work completed across backend and frontend, with zero regressions.

---

## 1. Faculty Profile Endpoint

**File**: [auth.py](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/backend/routers/auth.py)

New `GET /api/auth/faculty/profile` endpoint returns all employee columns except `Auth_Hash`:
- Employee_ID, Full_Name, Email, Designation
- Department_Name and Role_Name (resolved via joins)
- PDF_Balance, Profile_URL, Created_At

---

## 2. Pipeline Column Maximization

Previously many columns remained NULL throughout the workflow. Now:

| Step | File | Columns Now Populated |
|------|------|----------------------|
| 1 | [step_1_request.py](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/backend/consultancy_steps/step_1_request.py) | `Start_Date` |
| 2 | [step_2_response.py](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/backend/consultancy_steps/step_2_response.py) | `CPTS_Charges`, `Office_Share_Amt`, `Capital_Equip`, `CNL_Expenses`, `Est_Site_Visits` |
| 5 | [step_5_proforma.py](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/backend/consultancy_steps/step_5_proforma.py) | `Buyer_Order_No`, `Destination`, `Payment_Terms`, `Inst_PAN`, `Bank_Account_No` |
| 6 | [step_6_tax.py](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/backend/consultancy_steps/step_6_tax.py) | Same invoice metadata (copied from proforma) |
| 8 | [step_8_distribution.py](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/backend/consultancy_steps/step_8_distribution.py) | `Percentage_Rule` (dynamic), `PDF_Balance` (10% of PDF allocation) |

---

## 3. Input Sanitization & Step Reversal

### Sanitization
- Step 2: `Est_Faculty_Fees`, `Est_External_Fees`, `Operational_Exp` ≥ 0; `Proposed_Fee_Pct` 0–100
- Step 5: `Taxable_Value`, `Tax_Amount` ≥ 0
- Step 6: `Total_Received` > 0, `TDS_Deducted` ≥ 0 and ≤ `Total_Received`
- Step 8: All `Allocated_Amt` > 0

### Step Revert
**New files**:
- [step_revert.py](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/backend/consultancy_steps/step_revert.py) — cleanup logic per step
- Route: `POST /api/consultancy/{id}/revert` in [consultancy.py](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/backend/routers/consultancy.py)

Rolls back to the previous step by deleting artifacts created by the current step. Works for steps 2–9. Reverses PDF_Balance changes if step 8 is reverted.

---

## 4. Test Fixes

**File**: [conftest.py](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/backend/tests/conftest.py)

| Change | Before | After |
|--------|--------|-------|
| Director email | `director@test.com` | `director@vjti.ac.in` |
| Director password | `testpass123` | `adminHp$321` |
| Faculty department | ID 1 | ID 2 (Civil Engineering) |
| Coordinator ID | Hardcoded `1` | Dynamic (auto-incremented) |
| Departments seeded | 1 | 5 (Administration, Civil, Mechanical, Electrical, Computer) |

All **38 tests pass** with `backend/venv`.

---

## 5. Settings Modal Dual-Tab

**File**: [SettingsModal.tsx](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/frontend/components/modals/SettingsModal.tsx)

Two tabs:
- **Settings**: Existing form (name, profile URL, password change)
- **Profile Info**: Read-only view fetched from `/api/auth/faculty/profile` showing Employee ID, Email, Role, Department, Designation, PDF Balance, Member Since

---

## 6. VJTI Branding & Visual Fixes

### Color Scheme
[globals.css](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/frontend/app/globals.css) — `brand-*` remapped from sky-blue to VJTI maroon `#8B1A1A`, added `gold-*` accent palette `#C5960C`.

### Pages Updated
- Login landing, Faculty login, Client login, Signup landing, Dashboard sidebar — all show VJTI logo
- Client login button uses gold accent; faculty uses maroon
- Sidebar title: "VJTI Consultancy" with logo
- Role indicator uses gold color

### Visual Status Indicators
- [StepIndicator.tsx](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/frontend/components/ui/StepIndicator.tsx): Completed → green ✓ + "Done", Current → pulsing maroon + "In Progress", Future → grey
- [WorkflowContainer.tsx](file:///home/archuserbtw/tmp/dbms_minmax_proj_1/frontend/components/workflow/WorkflowContainer.tsx): Closed project shows "✅ Project Completed" with green banner instead of "Waiting on other party (Finished)"

---

## Verification Results

### Backend Tests
```
38 passed in 5.27s
```

### Frontend Build
```
✓ Compiled successfully — Next.js 16.2.2 (Turbopack)
✓ 14/14 static pages generated
```

### No Breaking Changes
- No schema modifications
- No CORS/env changes  
- No existing route signatures changed
- All existing test assertions preserved
