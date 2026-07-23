from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from app.config import settings
from app.database import student_collection
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_student(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        student_id: str = payload.get("sub")
        if student_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    try:
        student = await student_collection.find_one({"_id": ObjectId(student_id)})
        if student is None:
            raise credentials_exception
        
        # Convert ObjectId to string for Pydantic
        student["id"] = str(student["_id"])
        
        # Ensure role exists (default to student for legacy data)
        if "role" not in student:
            student["role"] = "student"
            
        return student
    except Exception:
        raise credentials_exception

async def get_current_vendor(user: dict = Depends(get_current_student)):
    if user.get("role") != "vendor" and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions. Vendor role required.")
    return user
