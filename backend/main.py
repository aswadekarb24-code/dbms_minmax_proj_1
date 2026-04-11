from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, consultancy, admin
import models.tables
from core.database import engine

# Normally we'd use Alembic, but here we can just ensure tables correspond.
# models.tables.Base.metadata.create_all(bind=engine) # Not needed if using schema directly

app = FastAPI(title="TPQA Management System API")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(consultancy.router)
app.include_router(admin.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
