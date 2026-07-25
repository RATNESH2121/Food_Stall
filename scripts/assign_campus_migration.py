import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv('MONGODB_URL', 'mongodb+srv://ratnesh:ratnesh@cluster1.no5yhoc.mongodb.net/food_booking_db?appName=Cluster1')

async def migrate():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.food_booking_db
    stalls_coll = db.stalls
    
    academic_stalls = ['LovelyBakeStudio', 'South City Cafe', 'Nescafe', 'Basant Icecream', 'DimSum Box', 'Gupta Canteen', 'Govinda Fresh Bites', 'Burger House']
    bh_stalls = ['Tripti', 'Pakka Adda', 'Hungry Panda', 'Hangouts', 'Food Factory', 'Canteen_BH6']
    gh_stalls = ['Amritsar zaika', 'Zaika']
    
    for name in academic_stalls:
        res = await stalls_coll.update_many({'stall_name': name}, {'$set': {'campus': 'Academic Block', 'is_open': True}})
        print(f'Academic Block: {name} (matched {res.matched_count})')

    for name in bh_stalls:
        res = await stalls_coll.update_many({'stall_name': name}, {'$set': {'campus': 'BH Area', 'is_open': True}})
        print(f'BH Area: {name} (matched {res.matched_count})')

    for name in gh_stalls:
        res = await stalls_coll.update_many({'stall_name': name}, {'$set': {'campus': 'Girls Hostel', 'is_open': True}})
        print(f'Girls Hostel: {name} (matched {res.matched_count})')

    print('\n🎉 MIGRATION COMPLETE! All stalls successfully assigned to campuses.')

if __name__ == '__main__':
    asyncio.run(migrate())
