import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv('MONGODB_URL', 'mongodb+srv://ratnesh:ratnesh@cluster1.no5yhoc.mongodb.net/food_booking_db?appName=Cluster1')

async def main():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.food_booking_db
    orders = await db.orders.find({'phone_number': {'$exists': False}}).to_list(100)
    print(f"Found {len(orders)} orders without phone_number. Backfilling...")
    for o in orders:
        student = await db.student_profiles.find_one({'phone_number': {'$exists': True}})
        if student and student.get('phone_number'):
            await db.orders.update_one({'_id': o['_id']}, {'$set': {'phone_number': student['phone_number']}})
            print(f"Updated {o.get('order_id')} with phone {student['phone_number']}")
    print("SUCCESS: Backfilled phone_number on all orders!")

if __name__ == '__main__':
    asyncio.run(main())
