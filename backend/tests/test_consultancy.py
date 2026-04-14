"""Tests for the 9-step consultancy workflow APIs."""

from tests.consultancy_steps_tests.helper import get_test_department_id


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
    dept_id = get_test_department_id()
    res = client.post("/api/consultancy/request", json={
        "Project_Title": "Test Audit Project",
        "Est_Person_Days": 30,
        "Contract_Period": "6 Months",
        "Liability_Period": "1 Year",
        "Department_ID": dept_id
    }, headers=auth_headers_client)
    assert res.status_code == 200
    data = res.json()
    assert data["Project_Title"] == "Test Audit Project"
    assert data["Current_Status"] == "REQUEST_BY_EXTERNAL_ORG"


def test_create_request_as_faculty_forbidden(client, auth_headers_faculty):
    """403 Forbidden: faculty cannot create a request (only organizations can)."""
    dept_id = get_test_department_id()
    res = client.post("/api/consultancy/request", json={
        "Project_Title": "Should Fail",
        "Department_ID": dept_id
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
