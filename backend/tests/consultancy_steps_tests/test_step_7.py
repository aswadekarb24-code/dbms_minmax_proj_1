from .helper import setup_project_to_step

def test_step_7_completion(client, auth_headers_client, auth_headers_faculty, auth_headers_director):
    pid = setup_project_to_step(6, client, auth_headers_client, auth_headers_faculty, auth_headers_director)
    res = client.post(f"/api/consultancy/{pid}/completion-report", json={
        "report_url": "dummy_url.pdf"
    }, headers=auth_headers_faculty)
    assert res.status_code == 200
    assert res.json()["project_status"] == "COMPLETION_REPORTS"
