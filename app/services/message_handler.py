import logging
from datetime import datetime, timezone
from app.database import student_collection, database
from app.services.conversation_manager import handle_conversation, get_state, update_state, clear_state
from app.services.whatsapp_service import send_whatsapp_message
from app.utils.security import get_password_hash

logger = logging.getLogger(__name__)

async def process_webhook_payload(payload: dict):
    """
    Parses the Meta webhook JSON and processes messages.
    """
    try:
        if payload.get("object") == "whatsapp_business_account":
            for entry in payload.get("entry", []):
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    messages = value.get("messages", [])
                    
                    for message in messages:
                        phone_number = message.get("from")
                        
                        # Extract text
                        text = ""
                        if message.get("type") == "text":
                            text = message["text"]["body"]
                        elif message.get("type") == "interactive":
                            interactive = message["interactive"]
                            if interactive["type"] == "button_reply":
                                text = interactive["button_reply"]["id"]
                            elif interactive["type"] == "list_reply":
                                text = interactive["list_reply"]["id"]
                                
                        if phone_number and text:
                            await process_incoming_message(phone_number, text)
                            
    except Exception as e:
        logger.error(f"Error processing webhook payload: {e}")

async def process_incoming_message(phone_number: str, text: str):
    logger.info(f"Received message from {phone_number}: {text}")
    text_clean = text.strip()
    
    # 1. Match student in DB
    student = await student_collection.find_one({"phone_number": phone_number})
    if not student and len(phone_number) > 10:
        last_10 = phone_number[-10:]
        student = await student_collection.find_one({"phone_number": {"$regex": f"{last_10}$"}})
        
    # 2. First-time registration check
    if not student:
        state_record = await get_state(phone_number)
        current_state = state_record.get("state")
        
        if current_state == "AWAIT_REGISTRATION":
            reg_no = text_clean
            # Save new student to MongoDB
            student_doc = {
                "registration_number": reg_no,
                "full_name": f"Student {reg_no}",
                "phone_number": phone_number,
                "password": get_password_hash("default123"),
                "role": "student",
                "created_at": datetime.now(timezone.utc)
            }
            res = await student_collection.insert_one(student_doc)
            student_doc["id"] = str(res.inserted_id)
            
            # Save to student_profiles collection as well
            await database.get_collection("student_profiles").insert_one({
                "phone_number": phone_number,
                "registration_number": reg_no,
                "created_at": datetime.now(timezone.utc)
            })
            
            await clear_state(phone_number)
            
            msg = (
                "✅ *Registration Complete!*\n\n"
                "👋 Welcome to SmartFood!\n\n"
                "What would you like to do today?\n\n"
                "1️⃣ Order Food\n"
                "2️⃣ Change Campus\n"
                "3️⃣ Help"
            )
            await send_whatsapp_message(phone_number, msg)
            return
        else:
            # First interaction from new phone number
            await update_state(phone_number, "AWAIT_REGISTRATION", {})
            msg = (
                "🍔 *Welcome to SmartFood LPU*\n\n"
                "Welcome!\n\n"
                "To continue, please complete a one-time registration.\n\n"
                "Please enter your LPU Registration Number."
            )
            await send_whatsapp_message(phone_number, msg)
            return

    student["id"] = str(student["_id"])
    await handle_conversation(student, text_clean)
