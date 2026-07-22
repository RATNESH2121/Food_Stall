from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    menu_item_id: str
    item_name: str
    quantity: int = Field(..., gt=0)
    price: float

class OrderCreate(BaseModel):
    stall_id: str
    items: List[OrderItem]
    pickup_date: str
    pickup_time: str

class OrderStatusUpdate(BaseModel):
    status: str

class OrderResponse(BaseModel):
    id: str
    order_id: str
    student_id: str
    stall_id: str
    items: List[OrderItem]
    total_amount: float
    pickup_date: str
    pickup_time: str
    status: str
    created_at: datetime
    updated_at: datetime
