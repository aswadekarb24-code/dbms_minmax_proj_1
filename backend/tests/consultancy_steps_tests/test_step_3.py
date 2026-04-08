from .helper import setup_project_to_step

def test_step_3_acceptance(client, auth_headers_client, auth_headers_faculty):
    pid = setup_project_to_step(2, client, auth_headers_client, auth_headers_faculty)
    res = client.post(f"/api/consultancy/{pid}/agency-acceptance", json={"accepted": True}, headers=auth_headers_client)
    assert res.status_code == 200
    assert res.json()["project_status"] == "AGENCY_ACCEPTANCE"
