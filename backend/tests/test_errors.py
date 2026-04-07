"""Tests for various HTTP error codes — 401, 403, 404, 422, 405."""


def test_protected_endpoint_no_token(client):
    """403 Forbidden: accessing protected endpoint without any auth header."""
    res = client.get("/api/consultancy/projects")
    assert res.status_code == 403


def test_protected_endpoint_invalid_token(client):
    """401 Unauthorized: accessing protected endpoint with a garbage token."""
    res = client.get("/api/consultancy/projects", headers={
        "Authorization": "Bearer invalidtokengarbage123"
    })
    assert res.status_code == 401


def test_invalid_json_body(client):
    """422 Unprocessable Entity: malformed POST body."""
    res = client.post("/api/auth/login/faculty", json={
        "wrong_field": "value"
    })
    assert res.status_code == 422


def test_method_not_allowed(client):
    """405 Method Not Allowed: using DELETE on a POST-only endpoint."""
    res = client.delete("/api/auth/login/faculty")
    assert res.status_code == 405


def test_health_check(client):
    """200: basic health check endpoint."""
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_signup_missing_required_fields(client):
    """422: signup with missing required fields."""
    res = client.post("/api/auth/signup/faculty", json={
        "full_name": "Incomplete"
        # Missing email, password, department_id, role_id, designation
    })
    assert res.status_code == 422


def test_login_invalid_email_format(client):
    """422: login with invalid email format."""
    res = client.post("/api/auth/login/faculty", json={
        "email": "not-an-email",
        "password": "anything"
    })
    assert res.status_code == 422


def test_project_detail_without_auth(client):
    """403: project detail endpoint without auth."""
    res = client.get("/api/consultancy/projects/1")
    assert res.status_code == 403


def test_workflow_step_without_auth(client):
    """403: calling a workflow step without auth."""
    res = client.post("/api/consultancy/1/faculty-response")
    assert res.status_code == 403
