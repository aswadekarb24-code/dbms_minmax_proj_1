from .helper import setup_project_to_step

def test_step_4_approval(client, auth_headers_client, auth_headers_faculty, auth_headers_director):
    pid = setup_project_to_step(3, client, auth_headers_client, auth_headers_faculty)
    res = client.post(f"/api/consultancy/{pid}/director-approval", json={"approved": True}, headers=auth_headers_director)
    assert res.status_code == 200
    assert res.json()["project_status"] == "DIRECTOR_APPROVAL"

def test_step_4_forbidden_non_director(client, auth_headers_client, auth_headers_faculty):
    pid = setup_project_to_step(3, client, auth_headers_client, auth_headers_faculty)
    # Faculty tries to approve (is PROJECT_COORDINATOR, not DIRECTOR)
    res = client.post(f"/api/consultancy/{pid}/director-approval", json={"approved": True}, headers=auth_headers_faculty)
    assert res.status_code == 403
