from passlib.context import CryptContext

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    passw = "testpassword"
    print(f"Hashing password: {passw}")
    hashed = pwd_context.hash(passw)
    print(f"Success: {hashed}")
except Exception as e:
    print(f"Failed: {e}")
    import traceback
    traceback.print_exc()
