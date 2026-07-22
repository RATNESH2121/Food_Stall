from fastapi import APIRouter
from app.schemas.student import StudentCreate, StudentLogin
from app.services import student_service
from app.utils.response import success_response

router = APIRouter(prefix="/auth", tags=["Student Authentication"])

@router.post("/register")
async def register(student_data: StudentCreate):
    result = await student_service.register_student(student_data)
    return success_response("Student registered successfully", result)

@router.post("/login")
async def login(login_data: StudentLogin):
    result = await student_service.login_student(login_data)
    return success_response("Login successful", result)
