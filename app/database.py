from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
database = client.food_booking_db

# Collections
student_collection = database.get_collection("students")
student_profile_collection = database.get_collection("student_profiles")
stall_collection = database.get_collection("stalls")
menu_collection = database.get_collection("menu")
order_collection = database.get_collection("orders")
slot_collection = database.get_collection("slots")
whatsapp_state_collection = database.get_collection("whatsapp_state")
conversation_memory_collection = database.get_collection("conversation_memory")
