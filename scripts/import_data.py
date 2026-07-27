import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv('MONGODB_URL', 'mongodb+srv://ratnesh:ratnesh@cluster1.no5yhoc.mongodb.net/food_booking_db?appName=Cluster1')

async def main():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.food_booking_db
    
    res = await db.orders.delete_many({'total_amount': {'$gt': 1000}})
    print(f"SUCCESS: Deleted {res.deleted_count} large test order(s)!")
    
    orders = await db.orders.find().to_list(100)
    print(f"=== REMAINING VALID ORDERS ({len(orders)}) ===")
    for o in orders:
        print(f"Order ID: {o.get('order_id')} - Amount: {o.get('total_amount')} - Status: {o.get('status')}")

if __name__ == '__main__':
    asyncio.run(main())
