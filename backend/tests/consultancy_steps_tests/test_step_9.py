from .helper import setup_project_to_step

def test_step_9_close(client, auth_headers_client, auth_headers_faculty, auth_headers_director):
    pid = setup_project_to_step(8, client, auth_headers_client, auth_headers_faculty, auth_headers_director)
    res = client.post(f"/api/consultancy/{pid}/close", json={}, headers=auth_headers_faculty)
    assert res.status_code == 200
    assert res.json()["project_status"] == "CLOSED"

def test_step_9_close_forbidden(client, auth_headers_client, auth_headers_faculty, auth_headers_director):
    pid = setup_project_to_step(8, client, auth_headers_client, auth_headers_faculty, auth_headers_director)
    res = client.post(f"/api/consultancy/{pid}/close", json={}, headers=auth_headers_client)
    assert res.status_code == 403
