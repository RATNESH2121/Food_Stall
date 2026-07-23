import asyncio
import json
import traceback
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.message_handler import process_webhook_payload
from app.config import settings

async def main():
    payload = {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "1287925997728757",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": "15551595606",
                        "phone_number_id": "1287925997728757"
                    },
                    "contacts": [{
                        "profile": {"name": "Ratnesh"},
                        "wa_id": "918002599534"
                    }],
                    "messages": [{
                        "from": "918002599534",
                        "id": "wamid.HBgLOTkxMjM0NTY3ODk=",
                        "timestamp": "1700000000",
                        "text": {"body": "Hi"},
                        "type": "text"
                    }]
                },
                "field": "messages"
            }]
        }]
    }
    
    settings.WHATSAPP_TOKEN = "FAKETOKEN"
    settings.MONGODB_URL = "mongodb+srv://ratnesh:ratnesh@cluster1.no5yhoc.mongodb.net/food_booking_db?appName=Cluster1"
    
    print("Running process_webhook_payload...")
    try:
        await process_webhook_payload(payload)
        print("process_webhook_payload finished.")
    except Exception as e:
        print("CRASHED:", e)
        traceback.print_exc()
        
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client.get_database("food_booking_db")
    memory_count = await db.conversation_memory.count_documents({})
    print(f"Memory count after processing: {memory_count}")

if __name__ == "__main__":
    asyncio.run(main())

