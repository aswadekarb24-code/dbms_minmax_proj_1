"""Tests for the 9-step consultancy workflow APIs."""


def test_get_projects_as_faculty(client, auth_headers_faculty):
    """200: faculty can list all projects."""
    res = client.get("/api/consultancy/projects", headers=auth_headers_faculty)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_projects_as_client(client, auth_headers_client):
    """200: client can list their own projects."""
    res = client.get("/api/consultancy/projects", headers=auth_headers_client)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_request_as_client(client, auth_headers_client):
    """201-equiv: client can create a consultancy request."""
    res = client.post("/api/consultancy/request", json={
        "Project_Title": "Test Audit Project",
        "Est_Person_Days": 30,
        "Contract_Period": "6 Months",
        "Liability_Period": "1 Year",
        "Department_ID": 1
    }, headers=auth_headers_client)
    assert res.status_code == 200
    data = res.json()
    assert data["Project_Title"] == "Test Audit Project"
    assert data["Current_Status"] == "REQUEST_BY_EXTERNAL_ORG"


def test_create_request_as_faculty_forbidden(client, auth_headers_faculty):
    """403 Forbidden: faculty cannot create a request (only organizations can)."""
    res = client.post("/api/consultancy/request", json={
        "Project_Title": "Should Fail",
        "Department_ID": 1
    }, headers=auth_headers_faculty)
    assert res.status_code == 403


def test_get_nonexistent_project(client, auth_headers_faculty):
    """404: requesting a non-existent project ID."""
    res = client.get("/api/consultancy/projects/99999", headers=auth_headers_faculty)
    assert res.status_code == 404


def test_get_departments(client):
    """200: departments endpoint returns list (no auth required)."""
    res = client.get("/api/consultancy/departments")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_roles(client):
    """200: roles endpoint returns list (no auth required)."""
    res = client.get("/api/consultancy/roles")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 4  # DIRECTOR, HOD, PROJECT_COORDINATOR, SUPPORT_STAFF
