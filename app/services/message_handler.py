import logging
from app.database import student_collection
from app.services.conversation_manager import handle_conversation
from app.services.whatsapp_service import send_whatsapp_message

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
    
    # Match student in DB
    student = await student_collection.find_one({"phone_number": phone_number})
    if not student:
        # Try without country code (last 10 digits) if applicable
        if len(phone_number) > 10:
            last_10 = phone_number[-10:]
            student = await student_collection.find_one({"phone_number": {"$regex": f"{last_10}$"}})
            
    if not student:
        logger.warning(f"Unregistered phone number: {phone_number}")
        await send_whatsapp_message(
            phone_number, 
            "Welcome to LPU Food Assistant! 🍔\nIt looks like your phone number is not registered. Please sign up on our portal first."
        )
        return
        
    student["id"] = str(student["_id"])
    await handle_conversation(student, text)
