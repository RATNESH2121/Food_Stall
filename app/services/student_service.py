from fastapi import HTTPException, status
from app.database import student_collection
from app.schemas.student import StudentCreate, StudentLogin
from app.utils.security import get_password_hash, verify_password, create_access_token
from bson import ObjectId

async def register_student(student_data: StudentCreate):
    # Check if student already exists
    existing_student = await student_collection.find_one({"registration_number": student_data.registration_number})
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student with this registration number already exists."
        )
    
    # Hash password
    student_dict = student_data.model_dump()
    student_dict["password"] = get_password_hash(student_dict["password"])
    
    # Insert to DB
    result = await student_collection.insert_one(student_dict)
    
    return {
        "id": str(result.inserted_id),
        "registration_number": student_data.registration_number,
        "full_name": student_data.full_name,
        "phone_number": student_data.phone_number
    }

async def login_student(login_data: StudentLogin):
    student = await student_collection.find_one({"registration_number": login_data.registration_number})
    
    if not student or not verify_password(login_data.password, student["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect registration number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": str(student["_id"])})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "student": {
            "id": str(student["_id"]),
            "registration_number": student["registration_number"],
            "full_name": student["full_name"],
        }
    }
