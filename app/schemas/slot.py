from pydantic import BaseModel
from typing import Optional

class SlotBase(BaseModel):
    slot_time: str
    maximum_orders: int = 20
    booked_orders: int = 0
    is_available: bool = True

class SlotResponse(SlotBase):
    id: str
