from pydantic import BaseModel
from typing import Optional

class StallBase(BaseModel):
    stall_name: str
    description: Optional[str] = None
    opening_time: str
    closing_time: str
    is_open: bool = True
    owner_id: Optional[str] = None

class StallCreate(StallBase):
    pass

class StallUpdate(BaseModel):
    stall_name: Optional[str] = None
    description: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    is_open: Optional[bool] = None

class StallResponse(StallBase):
    id: str
