from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from core.config import settings
import urllib.parse
# password = urllib.parse.quote_plus(settings.SUPABASE_DB_PASSWORD)
# engine = create_engine(f"postgresql://postgres.{settings.SUPABASE_REF}:{password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres")
engine = create_engine(settings.SUPABASE_DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
