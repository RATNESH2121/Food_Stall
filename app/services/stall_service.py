from fastapi import HTTPException, status
from app.database import stall_collection
from app.schemas.stall import StallCreate, StallUpdate
from bson import ObjectId
from bson.errors import InvalidId

async def create_stall(stall_data: StallCreate):
    stall_dict = stall_data.model_dump()
    result = await stall_collection.insert_one(stall_dict)
    stall_dict["id"] = str(result.inserted_id)
    stall_dict.pop("_id", None)
    return stall_dict

async def get_all_stalls():
    stalls = []
    cursor = stall_collection.find({})
    async for document in cursor:
        document["id"] = str(document.pop("_id"))
        stalls.append(document)
    return stalls

async def get_stall_by_id(stall_id: str):
    try:
        stall = await stall_collection.find_one({"_id": ObjectId(stall_id)})
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid stall ID format")
        
    if not stall:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stall not found")
        
    stall["id"] = str(stall.pop("_id"))
    return stall

async def update_stall(stall_id: str, stall_data: StallUpdate):
    try:
        update_data = {k: v for k, v in stall_data.model_dump().items() if v is not None}
        if not update_data:
            return await get_stall_by_id(stall_id)
            
        result = await stall_collection.update_one(
            {"_id": ObjectId(stall_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stall not found")
            
        return await get_stall_by_id(stall_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid stall ID format")

async def delete_stall(stall_id: str):
    try:
        result = await stall_collection.delete_one({"_id": ObjectId(stall_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stall not found")
        return {"id": stall_id}
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid stall ID format")
