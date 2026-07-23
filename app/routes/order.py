from fastapi import APIRouter, Depends
from app.schemas.order import OrderCreate, OrderStatusUpdate
from app.services import order_service
from app.utils.response import success_response
from app.dependencies import get_current_student

router = APIRouter(prefix="/orders", tags=["Student Orders"])

@router.post("")
async def place_order(order_data: OrderCreate, current_student: dict = Depends(get_current_student)):
    result = await order_service.place_order(current_student["id"], order_data)
    return success_response("Order placed successfully", result)

@router.get("/my")
async def get_my_orders(current_student: dict = Depends(get_current_student)):
    result = await order_service.get_student_orders(current_student["id"])
    return success_response("Orders retrieved successfully", result)

@router.get("/vendor")
async def get_vendor_orders(current_vendor: dict = Depends(get_current_student)):
    if current_vendor.get("role") != "vendor" and current_vendor.get("role") != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await order_service.get_vendor_orders(current_vendor["id"])
    return success_response("Vendor orders retrieved successfully", result)

@router.get("/{order_id}")
async def get_order_details(order_id: str, current_student: dict = Depends(get_current_student)):
    result = await order_service.get_order_by_id(order_id, current_student["id"])
    return success_response("Order details retrieved successfully", result)

@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: str, current_student: dict = Depends(get_current_student)):
    result = await order_service.cancel_order(order_id, current_student["id"])
    return success_response("Order cancelled successfully", result)
