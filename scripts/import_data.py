import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv('MONGODB_URL', 'mongodb+srv://ratnesh:ratnesh@cluster1.no5yhoc.mongodb.net/food_booking_db?appName=Cluster1')

async def test():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.food_booking_db
    
    for c_name in ['Academic Block', 'BH Area', 'Girls Hostel', 'Uni Mall']:
        stalls = await db.stalls.find({'campus': {'$regex': f'^{c_name}$', '$options': 'i'}, 'is_open': True}).to_list(100)
        print(f"=== {c_name} === ({len(stalls)} Stalls)")
        for s in stalls:
            print(f"  - {s.get('stall_name')}")

if __name__ == '__main__':
    asyncio.run(test())
