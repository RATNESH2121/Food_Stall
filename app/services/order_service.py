from fastapi import HTTPException, status
from app.database import order_collection, slot_collection, menu_collection, stall_collection
from app.schemas.order import OrderCreate, OrderStatusUpdate
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone

async def generate_order_id() -> str:
    count = await order_collection.count_documents({})
    return f"ORD{1001 + count}"

async def place_order(student_id: str, order_data: OrderCreate):
    # Validate Stall
    try:
        stall = await stall_collection.find_one({"_id": ObjectId(order_data.stall_id)})
        if not stall:
            raise HTTPException(status_code=404, detail="Stall not found")
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid stall ID")

    # Validate Slot
    slot = await slot_collection.find_one({"slot_time": order_data.pickup_time})
    if not slot:
        raise HTTPException(status_code=404, detail="Invalid pickup slot")
    
    if not slot["is_available"]:
        raise HTTPException(status_code=400, detail="Pickup slot is full")

    # Validate Menu Items and Calculate Total
    total_amount = 0.0
    for item in order_data.items:
        try:
            menu_item = await menu_collection.find_one({"_id": ObjectId(item.menu_item_id)})
            if not menu_item:
                raise HTTPException(status_code=404, detail=f"Menu item not found: {item.menu_item_id}")
            if menu_item["price"] != item.price:
                raise HTTPException(status_code=400, detail=f"Price mismatch for item: {item.item_name}")
            total_amount += (item.price * item.quantity)
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid menu item ID")

    # Increment slot booked orders
    new_booked = slot["booked_orders"] + 1
    is_available = new_booked < slot["maximum_orders"]
    
    await slot_collection.update_one(
        {"_id": slot["_id"]},
        {"$set": {"booked_orders": new_booked, "is_available": is_available}}
    )

    # Save Order
    order_dict = order_data.model_dump()
    order_dict["order_id"] = await generate_order_id()
    order_dict["student_id"] = student_id
    order_dict["total_amount"] = total_amount
    order_dict["status"] = "Booked"
    order_dict["created_at"] = datetime.now(timezone.utc)
    order_dict["updated_at"] = datetime.now(timezone.utc)

    result = await order_collection.insert_one(order_dict)
    order_dict["id"] = str(result.inserted_id)
    order_dict.pop("_id", None)
    return order_dict

async def get_student_orders(student_id: str):
    orders = []
    cursor = order_collection.find({"student_id": student_id}).sort("created_at", -1)
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        orders.append(doc)
    return orders

async def get_vendor_orders(vendor_id: str):
    # First, get the stall owned by this vendor
    stall = await stall_collection.find_one({"owner_id": vendor_id})
    if not stall:
        return []
        
    stall_id_str = str(stall["_id"])
    
    orders = []
    # We find orders where stall_id matches
    cursor = order_collection.find({"stall_id": stall_id_str}).sort("created_at", -1)
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        orders.append(doc)
    return orders

async def get_order_by_id(order_id: str, student_id: str = None):
    query = {"order_id": order_id}
    if student_id:
        query["student_id"] = student_id
        
    order = await order_collection.find_one(query)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order["id"] = str(order.pop("_id"))
    return order

async def cancel_order(order_id: str, student_id: str):
    order = await get_order_by_id(order_id, student_id)
    
    if order["status"] in ["Completed", "Cancelled", "Ready"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel order with status: {order['status']}")
        
    # Update order status
    await order_collection.update_one(
        {"order_id": order_id},
        {"$set": {"status": "Cancelled", "updated_at": datetime.now(timezone.utc)}}
    )
    
    # Decrement slot booked orders
    slot = await slot_collection.find_one({"slot_time": order["pickup_time"]})
    if slot and slot["booked_orders"] > 0:
        new_booked = slot["booked_orders"] - 1
        is_available = True
        await slot_collection.update_one(
            {"_id": slot["_id"]},
            {"$set": {"booked_orders": new_booked, "is_available": is_available}}
        )
        
    order["status"] = "Cancelled"
    order["updated_at"] = datetime.now(timezone.utc)
    return order

async def get_all_orders():
    orders = []
    cursor = order_collection.find({}).sort("created_at", -1)
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        orders.append(doc)
    return orders

async def update_order_status(order_id: str, status_data: OrderStatusUpdate):
    valid_statuses = ["Booked", "Preparing", "Ready", "Completed", "Cancelled"]
    if status_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    result = await order_collection.update_one(
        {"order_id": order_id},
        {"$set": {"status": status_data.status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = await get_order_by_id(order_id)
    
    # Send WhatsApp Notification to Student
    try:
        from app.database import student_collection
        from app.services.whatsapp_service import send_whatsapp_message
        
        student_id_val = order.get("student_id")
        student = None
        
        # Try finding student by ObjectId, string _id, or registration_number
        try:
            student = await student_collection.find_one({"_id": ObjectId(student_id_val)})
        except Exception:
            pass
            
        if not student:
            student = await student_collection.find_one({"_id": student_id_val})
            
        if not student:
            student = await student_collection.find_one({"registration_number": student_id_val})

        if student and student.get("phone_number"):
            phone = student["phone_number"]
            status_text = status_data.status
            if status_text == "Preparing":
                msg = f"🧑‍🍳 *Order Update*\nYour order *{order_id}* is now being *Prepared*!"
            elif status_text == "Ready":
                msg = f"✅ *Order Ready for Pickup!*\nYour order *{order_id}* is ready. Please pick it up from the stall!"
            elif status_text == "Completed":
                msg = f"🎉 *Order Completed*\nThank you for ordering with SmartFood!"
            else:
                msg = f"🔔 *Order Update*\nYour order *{order_id}* is now: *{status_text}*"

            import asyncio
            asyncio.create_task(send_whatsapp_message(phone, msg))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to send whatsapp notification: {e}")
        
    return order

async def get_dashboard_stats():
    total_orders = await order_collection.count_documents({})
    
    # Calculate today's start and end
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    
    todays_orders = await order_collection.count_documents({"created_at": {"$gte": today_start}})
    completed_orders = await order_collection.count_documents({"status": "Completed"})
    cancelled_orders = await order_collection.count_documents({"status": "Cancelled"})
    pending_orders = await order_collection.count_documents({"status": {"$in": ["Booked", "Preparing", "Ready"]}})
    
    # Aggregate total revenue (only completed orders)
    pipeline = [
        {"$match": {"status": "Completed"}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
    ]
    cursor = order_collection.aggregate(pipeline)
    revenue_result = await cursor.to_list(length=1)
    total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0.0

    return {
        "total_orders": total_orders,
        "todays_orders": todays_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "pending_orders": pending_orders,
        "total_revenue": total_revenue
    }
