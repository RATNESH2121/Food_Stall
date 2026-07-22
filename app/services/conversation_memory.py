from app.database import conversation_memory_collection
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

async def add_message(phone_number: str, role: str, content: str):
    """
    Adds a message to the conversation memory for a user.
    Role should be 'user' or 'model'.
    """
    message = {
        "role": role,
        "content": content,
        "timestamp": datetime.now()
    }
    
    # Push the new message to the array. If it doesn't exist, upsert creates it.
    # Keep only the last 10 messages using $slice to avoid massive context sizes.
    await conversation_memory_collection.update_one(
        {"phone_number": phone_number},
        {
            "$push": {
                "messages": {
                    "$each": [message],
                    "$slice": -10
                }
            },
            "$set": {"updated_at": datetime.now()}
        },
        upsert=True
    )

async def get_context(phone_number: str) -> str:
    """
    Retrieves the formatted conversation history string for prompting context.
    """
    record = await conversation_memory_collection.find_one({"phone_number": phone_number})
    if not record or not record.get("messages"):
        return ""
        
    context_str = "Conversation History:\n"
    for msg in record["messages"]:
        context_str += f"{msg['role'].capitalize()}: {msg['content']}\n"
    
    return context_str + "\n"

async def clear_memory(phone_number: str):
    """
    Clears the conversation memory for a user.
    """
    await conversation_memory_collection.delete_one({"phone_number": phone_number})
