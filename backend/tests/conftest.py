import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base, get_db
from main import app

# Use SQLite in-memory for testing so we don't touch Supabase
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables before test session and drop after."""
    Base.metadata.create_all(bind=engine)
    
    # Seed roles
    db = TestingSessionLocal()
    from models.tables import Role
    existing = db.query(Role).first()
    if not existing:
        db.add_all([
            Role(Role_Name="DIRECTOR"),
            Role(Role_Name="HOD"),
            Role(Role_Name="PROJECT_COORDINATOR"),
            Role(Role_Name="SUPPORT_STAFF"),
        ])
        db.commit()
    
    # Seed a department
    from models.tables import Department
    existing_dept = db.query(Department).first()
    if not existing_dept:
        db.add(Department(Department_Name="Civil Engineering"))
        db.commit()
    db.close()
    
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)

@pytest.fixture
def faculty_token(client):
    """Register and login a faculty user, return the JWT."""
    client.post("/api/auth/signup/faculty", json={
        "full_name": "Test Faculty",
        "email": "testfaculty@test.com",
        "password": "testpass123",
        "department_id": 1,
        "role_id": 3,  # PROJECT_COORDINATOR
        "designation": "Professor"
    })
    res = client.post("/api/auth/login/faculty", json={
        "email": "testfaculty@test.com",
        "password": "testpass123"
    })
    return res.json()["access_token"]

@pytest.fixture
def client_token(client):
    """Register and login a client user, return the JWT."""
    client.post("/api/auth/signup/client", json={
        "organization_name": "Test Corp",
        "contact_person_name": "John Doe",
        "contact_number": "+91-1234567890",
        "contact_email": "testclient@test.com",
        "password": "testpass123",
        "state_name": "Maharashtra",
        "state_code": "27",
        "office_address": "Test Address, Mumbai"
    })
    res = client.post("/api/auth/login/client", json={
        "email": "testclient@test.com",
        "password": "testpass123"
    })
    return res.json()["access_token"]

@pytest.fixture
def auth_headers_faculty(faculty_token):
    return {"Authorization": f"Bearer {faculty_token}"}

@pytest.fixture
def auth_headers_client(client_token):
    return {"Authorization": f"Bearer {client_token}"}
