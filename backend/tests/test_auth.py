"""Tests for authentication endpoints — signup, login, token validation."""


def test_signup_faculty_success(client):
    """201-equivalent: successful faculty registration returns a token."""
    res = client.post("/api/auth/signup/faculty", json={
        "full_name": "Dr. Auth Test",
        "email": "authtest_faculty@test.com",
        "password": "securepass",
        "department_id": 2,
        "role_id": 3,
        "designation": "Associate Professor"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user_type"] == "COLLEGE_OFFICIAL"


def test_signup_faculty_duplicate_email(client):
    """409 Conflict: registering with the same email twice should fail."""
    payload = {
        "full_name": "Duplicate Faculty",
        "email": "duplicate_faculty@test.com",
        "password": "pass",
        "department_id": 2,
        "role_id": 3,
        "designation": "Prof"
    }
    client.post("/api/auth/signup/faculty", json=payload)
    res = client.post("/api/auth/signup/faculty", json=payload)
    assert res.status_code == 409


def test_signup_client_success(client):
    """Successful client registration returns a token."""
    res = client.post("/api/auth/signup/client", json={
        "organization_name": "Auth Test Corp",
        "contact_person_name": "Jane",
        "contact_number": "+91-9999999999",
        "contact_email": "authtest_client@test.com",
        "password": "securepass",
        "state_name": "Maharashtra",
        "state_code": "27",
        "office_address": "Test HQ"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user_type"] == "ORGANIZATION"


def test_login_faculty_success(client):
    """200: correct credentials return token + user data."""
    # Ensure user exists
    client.post("/api/auth/signup/faculty", json={
        "full_name": "Login Test",
        "email": "logintest_fac@test.com",
        "password": "mypassword",
        "department_id": 2,
        "role_id": 2,
        "designation": "HOD"
    })
    res = client.post("/api/auth/login/faculty", json={
        "email": "logintest_fac@test.com",
        "password": "mypassword"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["Full_Name"] == "Login Test"


def test_login_faculty_wrong_password(client):
    """401 Unauthorized: wrong password should be rejected."""
    client.post("/api/auth/signup/faculty", json={
        "full_name": "Wrong Pass",
        "email": "wrongpass@test.com",
        "password": "correctpass",
        "department_id": 2,
        "role_id": 3,
        "designation": "Prof"
    })
    res = client.post("/api/auth/login/faculty", json={
        "email": "wrongpass@test.com",
        "password": "incorrectpass"
    })
    assert res.status_code == 401


def test_login_faculty_nonexistent(client):
    """404 Not Found: email not in database."""
    res = client.post("/api/auth/login/faculty", json={
        "email": "nobody@test.com",
        "password": "anything"
    })
    assert res.status_code == 404


def test_login_client_success(client):
    """200: correct client credentials return token + org data."""
    client.post("/api/auth/signup/client", json={
        "organization_name": "Client Login Corp",
        "contact_person_name": "Alice",
        "contact_number": "+91-8888888888",
        "contact_email": "clientlogin@test.com",
        "password": "clientpass",
        "state_name": "Maharashtra",
        "state_code": "27",
        "office_address": "Mumbai"
    })
    res = client.post("/api/auth/login/client", json={
        "email": "clientlogin@test.com",
        "password": "clientpass"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["Organization_Name"] == "Client Login Corp"


def test_login_client_wrong_password(client):
    """401: wrong client password."""
    client.post("/api/auth/signup/client", json={
        "organization_name": "WrongPass Corp",
        "contact_person_name": "Bob",
        "contact_number": "+91-7777777777",
        "contact_email": "wrongclient@test.com",
        "password": "rightpass",
        "state_name": "Maharashtra",
        "state_code": "27",
        "office_address": "Pune"
    })
    res = client.post("/api/auth/login/client", json={
        "email": "wrongclient@test.com",
        "password": "badpass"
    })
    assert res.status_code == 401
