from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import decode_access_token
from models.tables import Employee, Client

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        user_type = payload.get("user_type")
        if user_id is None or user_type is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        
        if user_type == "COLLEGE_OFFICIAL":
            user = db.query(Employee).filter(Employee.Employee_ID == int(user_id)).first()
        elif user_type == "ORGANIZATION":
            user = db.query(Client).filter(Client.Client_ID == int(user_id)).first()
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user_type")
            
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        return {"user": user, "user_type": user_type}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
