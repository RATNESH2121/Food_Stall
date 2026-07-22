from fastapi import APIRouter, Depends
from app.schemas.order import OrderStatusUpdate
from app.services import order_service
from app.utils.response import success_response

router = APIRouter(prefix="/admin", tags=["Admin Actions"])

@router.get("/orders")
async def get_all_orders():
    result = await order_service.get_all_orders()
    return success_response("All orders retrieved successfully", result)

@router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: OrderStatusUpdate):
    result = await order_service.update_order_status(order_id, status_data)
    return success_response("Order status updated successfully", result)

@router.get("/dashboard")
async def get_dashboard():
    result = await order_service.get_dashboard_stats()
    return success_response("Dashboard statistics retrieved successfully", result)
