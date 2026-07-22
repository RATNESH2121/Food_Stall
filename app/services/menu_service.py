from fastapi import HTTPException, status
from app.database import menu_collection, stall_collection
from app.schemas.menu import MenuCreate, MenuUpdate
from bson import ObjectId
from bson.errors import InvalidId

async def create_menu_item(menu_data: MenuCreate):
    try:
        stall_id = ObjectId(menu_data.stall_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid stall ID format")
        
    stall = await stall_collection.find_one({"_id": stall_id})
    if not stall:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stall not found")
        
    menu_dict = menu_data.model_dump()
    result = await menu_collection.insert_one(menu_dict)
    menu_dict["id"] = str(result.inserted_id)
    menu_dict.pop("_id", None)
    return menu_dict

async def get_all_menu_items(stall_id: str = None):
    query = {}
    if stall_id:
        query["stall_id"] = stall_id
        
    items = []
    cursor = menu_collection.find(query)
    async for document in cursor:
        document["id"] = str(document.pop("_id"))
        items.append(document)
    return items

async def get_menu_item_by_id(item_id: str):
    try:
        item = await menu_collection.find_one({"_id": ObjectId(item_id)})
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid menu item ID format")
        
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
        
    item["id"] = str(item.pop("_id"))
    return item

async def update_menu_item(item_id: str, menu_data: MenuUpdate):
    try:
        update_data = {k: v for k, v in menu_data.model_dump().items() if v is not None}
        if not update_data:
            return await get_menu_item_by_id(item_id)
            
        result = await menu_collection.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
            
        return await get_menu_item_by_id(item_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid menu item ID format")

async def delete_menu_item(item_id: str):
    try:
        result = await menu_collection.delete_one({"_id": ObjectId(item_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
        return {"id": item_id}
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid menu item ID format")
