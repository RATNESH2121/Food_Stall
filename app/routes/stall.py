from fastapi import APIRouter
from app.schemas.stall import StallCreate, StallUpdate
from app.services import stall_service
from app.utils.response import success_response

router = APIRouter(prefix="/stalls", tags=["Food Stalls"])

@router.post("")
async def create_stall(stall_data: StallCreate):
    result = await stall_service.create_stall(stall_data)
    return success_response("Stall created successfully", result)

@router.get("")
async def get_stalls():
    result = await stall_service.get_all_stalls()
    return success_response("Stalls retrieved successfully", result)

@router.put("/{stall_id}")
async def update_stall(stall_id: str, stall_data: StallUpdate):
    result = await stall_service.update_stall(stall_id, stall_data)
    return success_response("Stall updated successfully", result)

@router.delete("/{stall_id}")
async def delete_stall(stall_id: str):
    result = await stall_service.delete_stall(stall_id)
    return success_response("Stall deleted successfully", result)
