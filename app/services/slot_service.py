from fastapi import HTTPException, status
from app.database import slot_collection
from app.schemas.slot import SlotBase
from bson import ObjectId

async def initialize_sample_slots():
    slots = ["12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM"]
    for time in slots:
        exists = await slot_collection.find_one({"slot_time": time})
        if not exists:
            await slot_collection.insert_one({
                "slot_time": time,
                "maximum_orders": 20,
                "booked_orders": 0,
                "is_available": True
            })
    return {"message": "Sample slots initialized"}

async def get_all_slots():
    slots = []
    cursor = slot_collection.find({})
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        slots.append(doc)
    return slots

async def get_slot_by_time(slot_time: str):
    slot = await slot_collection.find_one({"slot_time": slot_time})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    slot["id"] = str(slot.pop("_id"))
    return slot
