def get_faculty_employee_id(client, auth_headers_faculty):
    """Resolve the test faculty's actual Employee_ID from the DB."""
    from tests.conftest import TestingSessionLocal
    from models.tables import Employee
    db = TestingSessionLocal()
    emp = db.query(Employee).filter(Employee.Email == "testfaculty@test.com").first()
    eid = emp.Employee_ID if emp else 1
    db.close()
    return eid


def get_test_department_id():
    """Return the department ID used by test faculty."""
    return 2


def setup_project_to_step(step: int, client, auth_headers_client, auth_headers_faculty, auth_headers_director=None):
    dept_id = get_test_department_id()
    coord_id = get_faculty_employee_id(client, auth_headers_faculty)

    # Step 1
    res = client.post("/api/consultancy/request", json={"Project_Title": f"Test Project for Step {step}", "Department_ID": dept_id}, headers=auth_headers_client)
    project_id = res.json()["Project_ID"]
    if step <= 1:
        return project_id
    
    # Step 2
    client.post(f"/api/consultancy/{project_id}/faculty-response", json={
        "Coordinator_ID": coord_id,
        "Proposed_Fee_Pct": 15.5,
        "Est_Faculty_Fees": 100.0,
        "Est_External_Fees": 50.0,
        "Operational_Exp": 20.0
    }, headers=auth_headers_faculty)
    if step <= 2:
        return project_id

    # Step 3
    client.post(f"/api/consultancy/{project_id}/agency-acceptance", json={"accepted": True}, headers=auth_headers_client)
    if step <= 3:
        return project_id

    # Step 4
    headers = auth_headers_director if auth_headers_director else auth_headers_faculty
    client.post(f"/api/consultancy/{project_id}/director-approval", json={"approved": True}, headers=headers)
    if step <= 4:
        return project_id

    # Step 5
    client.post(f"/api/consultancy/{project_id}/proforma-invoice", json={
        "HSN_SAC_Code": "998311",
        "Taxable_Value": 170.0,
        "Tax_Amount": 30.6
    }, headers=auth_headers_faculty)
    if step <= 5:
        return project_id

    # Step 6
    client.post(f"/api/consultancy/{project_id}/tax-invoice-receipt", json={
        "Voucher_Number": f"VR-{project_id}",
        "Receipt_Date": "2026-04-01",
        "Total_Received": 200.6,
        "TDS_Deducted": 0.0,
        "Bank_Trans_Ref": f"UTR-{project_id}"
    }, headers=auth_headers_faculty)
    if step <= 6:
        return project_id

    # Step 7
    client.post(f"/api/consultancy/{project_id}/completion-report", json={
        "report_url": "http://example.com/report.pdf"
    }, headers=auth_headers_faculty)
    if step <= 7:
        return project_id

    # Step 8
    client.post(f"/api/consultancy/{project_id}/distribution", json={
        "distributions": [
            {"Payee_Type": "PROJECT_COORDINATOR", "Employee_ID": coord_id, "Allocated_Amt": 140.42},
            {"Payee_Type": "OFFICE_SHARE", "Employee_ID": None, "Allocated_Amt": 60.18}
        ]
    }, headers=auth_headers_faculty)
    
    return project_id
