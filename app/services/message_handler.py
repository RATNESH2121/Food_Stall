import logging
from datetime import datetime, timezone
from app.database import student_collection, student_profile_collection
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
    
    # STEP 1, 2, 3: Search StudentProfile collection using phone_number
    profile = await student_profile_collection.find_one({"phone_number": phone_number})
    if not profile and len(phone_number) > 10:
        last_10 = phone_number[-10:]
        profile = await student_profile_collection.find_one({"phone_number": {"$regex": f"{last_10}$"}})

    # CASE 1: Phone number NOT FOUND in StudentProfile collection
    if not profile:
        state_record = await get_state(phone_number)
        current_state = state_record.get("state")
        
        if current_state == "AWAIT_REGISTRATION":
            reg_no = text_clean
            if not reg_no:
                await send_whatsapp_message(phone_number, "Registration number cannot be empty. Please enter your LPU Registration Number.")
                return

            now = datetime.now(timezone.utc)
            # Save into StudentProfile collection
            profile_doc = {
                "phone_number": phone_number,
                "registration_number": reg_no,
                "created_at": now
            }
            await student_profile_collection.insert_one(profile_doc)
            
            # Also save/upsert into student_collection so place_order works seamlessly
            student = await student_collection.find_one({"registration_number": reg_no})
            if not student:
                student_doc = {
                    "registration_number": reg_no,
                    "full_name": f"Student {reg_no}",
                    "phone_number": phone_number,
                    "password": get_password_hash("default123"),
                    "role": "student",
                    "created_at": now
                }
                res = await student_collection.insert_one(student_doc)
                student_doc["id"] = str(res.inserted_id)
            else:
                await student_collection.update_one({"registration_number": reg_no}, {"$set": {"phone_number": phone_number}})
                student["id"] = str(student["_id"])
            
            await clear_state(phone_number)
            
            # Replying after successful save:
            msg = (
                "✅ Registration Successful.\n\n"
                "Welcome to SmartFood LPU.\n\n"
                "What would you like to do today?\n\n"
                "1️⃣ Order Food\n\n"
                "2️⃣ Change Campus\n\n"
                "3️⃣ Help"
            )
            await send_whatsapp_message(phone_number, msg)
            return
        else:
            # First interaction from unregistered phone number
            await update_state(phone_number, "AWAIT_REGISTRATION", {})
            msg = (
                "🍔 Welcome to SmartFood LPU\n\n"
                "Before ordering food, please complete a one-time registration.\n\n"
                "Please enter your LPU Registration Number."
            )
            await send_whatsapp_message(phone_number, msg)
            return

    # CASE 2: Phone number ALREADY EXISTS in StudentProfile collection
    student = await student_collection.find_one({"phone_number": phone_number})
    if not student:
        reg_no = profile.get("registration_number", "UNKNOWN")
        student = await student_collection.find_one({"registration_number": reg_no})
        
    if not student:
        reg_no = profile.get("registration_number", "UNKNOWN")
        student_doc = {
            "registration_number": reg_no,
            "full_name": f"Student {reg_no}",
            "phone_number": phone_number,
            "password": get_password_hash("default123"),
            "role": "student",
            "created_at": datetime.now(timezone.utc)
        }
        res = await student_collection.insert_one(student_doc)
        student = student_doc
        student["id"] = str(res.inserted_id)
    else:
        student["id"] = str(student["_id"])

    await handle_conversation(student, text_clean)
