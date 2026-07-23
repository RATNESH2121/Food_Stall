from pydantic import BaseModel, Field
from typing import Optional

class StudentCreate(BaseModel):
    registration_number: str = Field(..., description="Student registration number")
    full_name: str = Field(..., description="Full name of the student")
    phone_number: str = Field(..., description="Contact phone number")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    role: str = Field(default="student", description="Role of the user: student, vendor, or district_admin")

class StudentLogin(BaseModel):
    registration_number: str
    password: str

class StudentResponse(BaseModel):
    id: str
    registration_number: str
    full_name: str
    phone_number: str
    role: str = "student"
