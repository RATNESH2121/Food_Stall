from fastapi import APIRouter, Query, Depends, HTTPException
from app.schemas.menu import MenuCreate, MenuUpdate
from app.services import menu_service
from app.utils.response import success_response
from app.dependencies import get_current_vendor
from app.database import stall_collection, menu_collection
from typing import Optional
from bson import ObjectId

router = APIRouter(prefix="/menu", tags=["Menu Items"])

@router.post("")
async def create_menu_item(menu_data: MenuCreate, current_vendor: dict = Depends(get_current_vendor)):
    # Verify the vendor owns the stall
    stall = await stall_collection.find_one({"_id": ObjectId(menu_data.stall_id)})
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")
        
    if stall.get("owner_id") != current_vendor["id"] and current_vendor.get("role") != "admin":
        raise HTTPException(status_code=403, detail="You do not own this stall")
        
    result = await menu_service.create_menu_item(menu_data)
    return success_response("Menu item created successfully", result)

@router.get("")
async def get_menu_items(stall_id: Optional[str] = Query(None, description="Filter by stall ID")):
    result = await menu_service.get_all_menu_items(stall_id)
    return success_response("Menu items retrieved successfully", result)

@router.put("/{item_id}")
async def update_menu_item(item_id: str, menu_data: MenuUpdate, current_vendor: dict = Depends(get_current_vendor)):
    # Verify ownership
    item = await menu_collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    stall = await stall_collection.find_one({"_id": ObjectId(item.get("stall_id"))})
    if stall and stall.get("owner_id") != current_vendor["id"] and current_vendor.get("role") != "admin":
        raise HTTPException(status_code=403, detail="You do not own the stall for this item")
        
    result = await menu_service.update_menu_item(item_id, menu_data)
    return success_response("Menu item updated successfully", result)

@router.delete("/{item_id}")
async def delete_menu_item(item_id: str, current_vendor: dict = Depends(get_current_vendor)):
    # Verify ownership
    item = await menu_collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    stall = await stall_collection.find_one({"_id": ObjectId(item.get("stall_id"))})
    if stall and stall.get("owner_id") != current_vendor["id"] and current_vendor.get("role") != "admin":
        raise HTTPException(status_code=403, detail="You do not own the stall for this item")
        
    result = await menu_service.delete_menu_item(item_id)
    return success_response("Menu item deleted successfully", result)
