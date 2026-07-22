from fastapi import APIRouter
from app.services import slot_service
from app.utils.response import success_response
from app.database import stall_collection, menu_collection, student_collection
from app.utils.security import get_password_hash

router = APIRouter(prefix="/seed", tags=["Sample Data Seeding"])

@router.post("/sample-data")
async def generate_sample_data():
    # 1. Initialize Slots
    await slot_service.initialize_sample_slots()
    
    # 2. Seed Student & Admin
    student = await student_collection.find_one({"registration_number": "123456"})
    if not student:
        await student_collection.insert_one({
            "registration_number": "123456",
            "full_name": "John Doe",
            "phone_number": "9876543210",
            "password": get_password_hash("password123")
        })

    admin = await student_collection.find_one({"registration_number": "admin"})
    if not admin:
        await student_collection.insert_one({
            "registration_number": "admin",
            "full_name": "System Admin",
            "phone_number": "0000000000",
            "password": get_password_hash("admin")
        })
    
    # 3. Seed Stall
    stall = await stall_collection.find_one({"stall_name": "Sanjay's Cafe"})
    if not stall:
        result = await stall_collection.insert_one({
            "stall_name": "Sanjay's Cafe",
            "description": "Best coffee and snacks on campus",
            "opening_time": "09:00 AM",
            "closing_time": "06:00 PM",
            "is_open": True
        })
        stall_id = result.inserted_id
    else:
        stall_id = stall["_id"]
        
    # 4. Seed Menu Items
    menu_item = await menu_collection.find_one({"item_name": "Cold Coffee", "stall_id": str(stall_id)})
    if not menu_item:
        await menu_collection.insert_one({
            "stall_id": str(stall_id),
            "item_name": "Cold Coffee",
            "price": 50.0,
            "category": "Beverage",
            "is_available": True
        })
        await menu_collection.insert_one({
            "stall_id": str(stall_id),
            "item_name": "Samosa",
            "price": 15.0,
            "category": "Snacks",
            "is_available": True
        })

    return success_response("Sample data successfully generated")
