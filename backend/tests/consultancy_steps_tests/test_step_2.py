from .helper import get_faculty_employee_id, get_test_department_id


def test_step_2_response(client, auth_headers_client, auth_headers_faculty):
    dept_id = get_test_department_id()
    coord_id = get_faculty_employee_id(client, auth_headers_faculty)

    # 1. Setup project
    res = client.post("/api/consultancy/request", json={
        "Project_Title": "Step 2 Test Project",
        "Department_ID": dept_id
    }, headers=auth_headers_client)
    project_id = res.json()["Project_ID"]

    # 2. Test Step 2
    res2 = client.post(f"/api/consultancy/{project_id}/faculty-response", json={
        "Coordinator_ID": coord_id,
        "Proposed_Fee_Pct": 15.5,
        "Est_Faculty_Fees": 100000.0,
        "Est_External_Fees": 50000.0,
        "Operational_Exp": 20000.0
    }, headers=auth_headers_faculty)
    assert res2.status_code == 200
    assert res2.json()["project_status"] == "RESPONSE_BY_FACULTY"

def test_step_2_forbidden(client, auth_headers_client):
    # client cannot do faculty response
    res = client.post(f"/api/consultancy/1/faculty-response", json={
        "Coordinator_ID": 999,
        "Proposed_Fee_Pct": 15.5,
        "Est_Faculty_Fees": 100000.0,
        "Est_External_Fees": 50000.0,
        "Operational_Exp": 20000.0
    }, headers=auth_headers_client)
    assert res.status_code == 403
