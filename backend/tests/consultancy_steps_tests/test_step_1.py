def test_step_1_request(client, auth_headers_client, auth_headers_faculty):
    res = client.post("/api/consultancy/request", json={
        "Project_Title": "Test Complete Workflow",
        "Est_Person_Days": 10,
        "Contract_Period": "3 Months",
        "Liability_Period": "6 Months",
        "Department_ID": 1
    }, headers=auth_headers_client)
    assert res.status_code == 200
    data = res.json()
    assert data["Current_Status"] == "REQUEST_BY_EXTERNAL_ORG"
    assert data["Project_Title"] == "Test Complete Workflow"

def test_step_1_forbidden(client, auth_headers_faculty):
    res = client.post("/api/consultancy/request", json={
        "Project_Title": "Should fail",
        "Department_ID": 1
    }, headers=auth_headers_faculty)
    assert res.status_code == 403
