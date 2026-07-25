import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv('MONGODB_URL', 'mongodb+srv://ratnesh:ratnesh@cluster1.no5yhoc.mongodb.net/food_booking_db?appName=Cluster1')

async def main():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.food_booking_db
    stalls = await db.stalls.find().to_list(100)
    print(f"=== TOTAL STALLS IN DB: {len(stalls)} ===")
    for s in stalls:
        cnt = await db.menu.count_documents({'stall_id': str(s['_id'])})
        print(f"- {s.get('stall_name')} (Location: {s.get('campus')}): {cnt} menu items")
    
    total_menu = await db.menu.count_documents({})
    print(f"=== TOTAL MENU ITEMS IN MONGODB: {total_menu} ===")

if __name__ == '__main__':
    asyncio.run(main())
