from pydantic import BaseModel, Field
from typing import Optional

class StudentCreate(BaseModel):
    registration_number: Optional[str] = Field(None, description="Student registration number (required for students)")
    email: Optional[str] = Field(None, description="Vendor email address (required for vendors)")
    vendor_name: Optional[str] = Field(None, description="Name of the stall/vendor (required for vendors)")
    full_name: str = Field(..., description="Full name or Owner name")
    phone_number: str = Field(..., description="Contact phone number")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    role: str = Field(default="student", description="Role of the user: student, vendor, or district_admin")

class StudentLogin(BaseModel):
    identifier: str
    password: str

class StudentResponse(BaseModel):
    id: str
    registration_number: Optional[str] = None
    email: Optional[str] = None
    vendor_name: Optional[str] = None
    full_name: str
    phone_number: str
    role: str = "student"
