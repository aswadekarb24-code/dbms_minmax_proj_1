def test_step_2_response(client, auth_headers_client, auth_headers_faculty):
    # 1. Setup project
    res = client.post("/api/consultancy/request", json={
        "Project_Title": "Step 2 Test Project",
        "Department_ID": 1
    }, headers=auth_headers_client)
    print(res.json())
    project_id = res.json()["Project_ID"]

    # 2. Test Step 2
    res2 = client.post(f"/api/consultancy/{project_id}/faculty-response", json={
        "Coordinator_ID": 1,
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
        "Coordinator_ID": 1,
        "Proposed_Fee_Pct": 15.5,
        "Est_Faculty_Fees": 100000.0,
        "Est_External_Fees": 50000.0,
        "Operational_Exp": 20000.0
    }, headers=auth_headers_client)
    assert res.status_code == 403

