from fastapi import APIRouter, Depends, HTTPException
from app.schemas.stall import StallCreate, StallUpdate
from app.services import stall_service
from app.utils.response import success_response
from app.dependencies import get_current_vendor
from app.database import stall_collection
from bson import ObjectId

router = APIRouter(prefix="/stalls", tags=["Food Stalls"])

@router.post("")
async def create_stall(stall_data: StallCreate, current_vendor: dict = Depends(get_current_vendor)):
    # Check if vendor already has a stall
    existing_stall = await stall_collection.find_one({"owner_id": current_vendor["id"]})
    if existing_stall and current_vendor.get("role") != "admin":
        raise HTTPException(status_code=400, detail="You can only manage one stall.")
        
    stall_data.owner_id = current_vendor["id"]
    result = await stall_service.create_stall(stall_data)
    return success_response("Stall created successfully", result)

@router.get("")
async def get_stalls():
    result = await stall_service.get_all_stalls()
    return success_response("Stalls retrieved successfully", result)

@router.put("/{stall_id}")
async def update_stall(stall_id: str, stall_data: StallUpdate, current_vendor: dict = Depends(get_current_vendor)):
    existing_stall = await stall_collection.find_one({"_id": ObjectId(stall_id)})
    if not existing_stall:
        raise HTTPException(status_code=404, detail="Stall not found")
        
    if existing_stall.get("owner_id") != current_vendor["id"] and current_vendor.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this stall")
        
    result = await stall_service.update_stall(stall_id, stall_data)
    return success_response("Stall updated successfully", result)

@router.delete("/{stall_id}")
async def delete_stall(stall_id: str, current_vendor: dict = Depends(get_current_vendor)):
    existing_stall = await stall_collection.find_one({"_id": ObjectId(stall_id)})
    if not existing_stall:
        raise HTTPException(status_code=404, detail="Stall not found")
        
    if existing_stall.get("owner_id") != current_vendor["id"] and current_vendor.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this stall")
        
    result = await stall_service.delete_stall(stall_id)
    return success_response("Stall deleted successfully", result)
