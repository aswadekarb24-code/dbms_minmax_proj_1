import psycopg2
import sys

# DATABASE SETTINGS
# Note: For port 6543, the user MUST be "postgres.[YOUR-PROJECT-REF]"
db_config = {
    "dbname": "postgres",
    "user": "postgres.dfccsyabadxqlmfeeqgs", 
    "password": "67EvergreenDBMS",
    "host": "aws-0-ap-south-1.pooler.supabase.com",
    "port": "5432"
}

def test_connection():
    conn = None
    try:
        print(f"Attempting to connect to {db_config['host']}...")
        
        # Connect to the database
        conn = psycopg2.connect(**db_config)
        
        # Create a cursor to execute a simple query
        cur = conn.cursor()
        cur.execute("SELECT version();")
        db_version = cur.fetchone()
        
        print("✅ SUCCESS: Connection established!")
        print(f"PostgreSQL version: {db_version[0]}")
        
        cur.close()
    except Exception as e:
        print("❌ FAILED: Unable to connect.")
        print(f"Error Details: {e}")
    finally:
        if conn is not None:
            conn.close()
            print("Connection closed.")

if __name__ == "__main__":
    test_connection()