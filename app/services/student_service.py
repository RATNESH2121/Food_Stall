from fastapi import HTTPException, status
from app.database import student_collection
from app.schemas.student import StudentCreate, StudentLogin
from app.utils.security import get_password_hash, verify_password, create_access_token
from bson import ObjectId

async def register_student(student_data: StudentCreate):
    # Role-based validation
    if student_data.role == "vendor":
        if not student_data.email or not student_data.vendor_name:
            raise HTTPException(status_code=400, detail="Email and Vendor Name are required for vendors.")
        
        existing_vendor = await student_collection.find_one({"email": student_data.email})
        if existing_vendor:
            raise HTTPException(status_code=400, detail="Vendor with this email already exists.")
            
    else: # student
        if not student_data.registration_number:
            raise HTTPException(status_code=400, detail="Registration number is required for students.")
            
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
        "email": student_data.email,
        "full_name": student_data.full_name,
        "phone_number": student_data.phone_number,
        "role": student_data.role
    }

async def login_student(login_data: StudentLogin):
    # Find by either registration number OR email
    student = await student_collection.find_one({
        "$or": [
            {"registration_number": login_data.identifier},
            {"email": login_data.identifier}
        ]
    })
    
    if not student or not verify_password(login_data.password, student["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login credentials",
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
