from fastapi import APIRouter, Query
from app.schemas.menu import MenuCreate, MenuUpdate
from app.services import menu_service
from app.utils.response import success_response
from typing import Optional

router = APIRouter(prefix="/menu", tags=["Menu Items"])

@router.post("")
async def create_menu_item(menu_data: MenuCreate):
    result = await menu_service.create_menu_item(menu_data)
    return success_response("Menu item created successfully", result)

@router.get("")
async def get_menu_items(stall_id: Optional[str] = Query(None, description="Filter by stall ID")):
    result = await menu_service.get_all_menu_items(stall_id)
    return success_response("Menu items retrieved successfully", result)

@router.put("/{item_id}")
async def update_menu_item(item_id: str, menu_data: MenuUpdate):
    result = await menu_service.update_menu_item(item_id, menu_data)
    return success_response("Menu item updated successfully", result)

@router.delete("/{item_id}")
async def delete_menu_item(item_id: str):
    result = await menu_service.delete_menu_item(item_id)
    return success_response("Menu item deleted successfully", result)
