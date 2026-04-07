from sqlalchemy import create_engine, text
import urllib.parse

# --- CONFIGURATION ---
DB_USER = "postgres.dfccsyabadxqlmfeeqgs"  # Must have the dot and project ref
DB_PASS = "67EvergreenDBMS"              # We will handle special characters below
DB_HOST = "aws-0-ap-south-1.pooler.supabase.com"
DB_PORT = "6543"
DB_NAME = "postgres"

# URL-encode the password in case it has special characters (@, #, !, etc.)
safe_password = urllib.parse.quote_plus(DB_PASS)

# Constructing the connection string using pg8000
# Format: postgresql+pg8000://user:password@host:port/dbname
connection_uri = f"postgresql+pg8000://{DB_USER}:{safe_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def test_connection():
    print(f"Testing connection via pg8000 to: {DB_HOST}")
    engine = create_engine(connection_uri)
    
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT now();"))
            print("✅ SUCCESS: The database responded!")
            print(f"Server time: {result.fetchone()[0]}")
            
    except Exception as e:
        print("❌ FAILED: Still getting an error.")
        print("-" * 30)
        print(f"Error Type: {type(e).__name__}")
        print(f"Full Error: {e}")
        print("-" * 30)
        
        if "Tenant or user not found" in str(e):
            print("\nDIAGNOSIS: The Pooler still doesn't recognize your ID.")
            print("Check: Is the Project Ref lowercase? Is the pooler enabled in Supabase settings?")

if __name__ == "__main__":
    test_connection()