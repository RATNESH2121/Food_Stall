from pydantic import BaseModel, Field
from typing import Optional

class MenuBase(BaseModel):
    stall_id: str = Field(..., description="ID of the food stall")
    item_name: str = Field(..., description="Name of the food item")
    price: float = Field(..., gt=0, description="Price of the item")
    category: str = Field(..., description="Category like beverage, snack, etc.")
    is_available: bool = True
    prep_time_minutes: int = Field(5, description="Average preparation time in minutes")

class MenuCreate(MenuBase):
    pass

class MenuUpdate(BaseModel):
    item_name: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    is_available: Optional[bool] = None
    prep_time_minutes: Optional[int] = Field(None, ge=0)

class MenuResponse(MenuBase):
    id: str
